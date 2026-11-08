import { StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, tabularNums } from '@/theme';
import type { WalletTransaction } from '@/types/wallet';
import { formatRecentTime, formatSignedDong } from '@/utils/format';
import { latestTransactions } from '../mappers/recentActivity';
import ActivityRow from './ActivityRow';
import HomeSection, { RowSkeleton, SectionMessage } from './HomeSection';

type Props = {
  transactions: WalletTransaction[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSeeAll: () => void;
  /** Ví chưa có giao dịch nào: gợi ý việc tiếp theo là nạp tiền. */
  onTopUp: () => void;
};

const TITLE = 'Giao dịch gần đây';

/** Trình đọc màn hình đọc "đồng" rõ hơn ký hiệu "đ". */
const spokenDong = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(Math.abs(amount))} đồng`;

/** Mục "Giao dịch gần đây": vài giao dịch ví mới nhất từ `GET /wallets/me/transactions`. */
export default function RecentActivitySection({ transactions, loading, error, onRetry, onSeeAll, onTopUp }: Props) {
  if (!transactions) {
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

  const recent = latestTransactions(transactions);

  if (recent.length === 0) {
    return (
      <HomeSection title={TITLE}>
        <SectionMessage text="Ví của bạn chưa có giao dịch nào." actionLabel="Nạp tiền" onAction={onTopUp} />
      </HomeSection>
    );
  }

  return (
    <HomeSection title={TITLE} onSeeAll={onSeeAll} seeAllLabel="Xem tất cả giao dịch ví">
      {recent.map((tx, i) => {
        const incoming = tx.direction === 'in';
        const time = formatRecentTime(tx.occurredAt);
        return (
          <ActivityRow
            // Một giao dịch có thể vừa trừ vừa cộng vào cùng ví: mã giao dịch thôi chưa đủ làm khoá.
            key={`${tx.id}-${tx.direction}`}
            icon={incoming ? 'download' : 'arrowUpRight'}
            tone={incoming ? 'green' : 'blue'}
            title={tx.description}
            subtitle={time}
            right={
              <Text style={[styles.amount, incoming && styles.amountIn]}>
                {formatSignedDong(tx.amount, tx.direction)}
              </Text>
            }
            accessibilityLabel={`${tx.description}, ${time}, ${incoming ? 'tiền vào' : 'tiền ra'} ${spokenDong(tx.amount)}`}
            divider={i > 0}
          />
        );
      })}
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
});
