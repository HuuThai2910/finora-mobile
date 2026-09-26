import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, tabularNums } from '@/theme';
import { formatRecentTime, formatSignedDong } from '@/utils/format';
import type { HomeSummary } from '../api';
import ActivityRow from './ActivityRow';
import HomeSection, { RowSkeleton, SectionMessage } from './HomeSection';

type Props = {
  summary: HomeSummary | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSeeAll: () => void;
};

const TITLE = 'Giao dịch gần đây';

/** Trình đọc màn hình đọc "đồng" rõ hơn ký hiệu "đ". */
const spokenDong = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)} đồng`;

/** Mục "Giao dịch gần đây": vài giao dịch ví mới nhất và bản ghi hợp đồng trên chuỗi. */
export default function RecentActivitySection({ summary, loading, error, onRetry, onSeeAll }: Props) {
  if (!summary) {
    return (
      <HomeSection title={TITLE}>
        {loading ? (
          <>
            <RowSkeleton round />
            <RowSkeleton round />
          </>
        ) : (
          <SectionMessage
            text={error ?? 'Chưa tải được giao dịch gần đây.'}
            actionLabel="Thử lại"
            onAction={onRetry}
          />
        )}
      </HomeSection>
    );
  }

  const { recent, chainRef } = summary;
  const chainTime = formatRecentTime(chainRef.occurredAt);

  return (
    <HomeSection title={TITLE} onSeeAll={onSeeAll} seeAllLabel="Xem tất cả giao dịch ví">
      {recent.map((tx, i) => {
        const incoming = tx.direction === 'in';
        const time = formatRecentTime(tx.occurredAt);
        return (
          <ActivityRow
            key={tx.id}
            icon={incoming ? 'download' : 'arrowUpRight'}
            tone={incoming ? 'green' : 'blue'}
            title={tx.label}
            subtitle={time}
            right={
              <Text style={[styles.amount, incoming && styles.amountIn]}>
                {formatSignedDong(tx.amount, tx.direction)}
              </Text>
            }
            accessibilityLabel={`${tx.label}, ${time}, ${incoming ? 'tiền vào' : 'tiền ra'} ${spokenDong(tx.amount)}`}
            divider={i > 0}
          />
        );
      })}

      <ActivityRow
        icon="chain"
        title={chainRef.label}
        subtitle={chainTime}
        right={
          <View style={styles.hash}>
            <Text style={styles.hashText}>{chainRef.tx}</Text>
          </View>
        }
        accessibilityLabel={`${chainRef.label}, ${chainTime}, mã giao dịch ${chainRef.tx}`}
        divider={recent.length > 0}
      />
    </HomeSection>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authInk,
    ...tabularNums,
  },
  // Xanh lá kèm dấu "+" nên không chỉ dựa vào màu để phân biệt tiền vào.
  amountIn: { color: Colors.green },
  hash: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.authNoteBg,
  },
  hashText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.authNoteText,
  },
});
