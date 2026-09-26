import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing, tabularNums } from '@/theme';
import { formatDate, formatDong } from '@/utils/format';
import type { StatusMeta } from '../constant';
import type { DecisionDate, KeyTerm } from '../mappers/applicationSummary';
import DetailButton from './DetailButton';
import DetailCard from './DetailCard';
import DetailStatusPill from './DetailStatusPill';
import SummaryKeyTerms from './SummaryKeyTerms';

type Props = {
  productName: string;
  amount: number;
  status: StatusMeta;
  decision: DecisionDate | null;
  keyTerms: readonly KeyTerm[];
  /** Nút hợp đồng khi hồ sơ đã tới bước hợp đồng; `null` thì không có nút. */
  action: { label: string; urgent: boolean; onPress: () => void } | null;
};

/**
 * Thẻ đầu màn chi tiết (mockup 26/09/2026): sản phẩm, trạng thái, số tiền vay,
 * ba thông số chính, rồi ý nghĩa trạng thái, bước kế tiếp và nút hợp đồng (trước
 * đây là khối trạng thái riêng). Gom vào một thẻ để câu hỏi "hồ sơ đang ở đâu,
 * làm gì tiếp" được trả lời ngay trên cùng.
 */
export default function ApplicationSummaryCard({
  productName,
  amount,
  status,
  decision,
  keyTerms,
  action,
}: Props) {
  const amountText = formatDong(amount);

  return (
    <DetailCard style={styles.card}>
      <View style={styles.head}>
        {/* Tên sản phẩm dài + nhãn trạng thái dài thì nhãn xuống dòng, không cắt chữ. */}
        <View style={styles.topRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText} maxFontSizeMultiplier={1.4}>
              {productName}
            </Text>
          </View>
          <DetailStatusPill status={status} />
        </View>
        <Text
          style={styles.amount}
          accessibilityLabel={`Số tiền vay ${amountText}`}
          maxFontSizeMultiplier={1.2}
        >
          {amountText}
        </Text>
        {decision ? (
          <Text style={styles.date}>{`${decision.label} ${formatDate(decision.at)}`}</Text>
        ) : null}
      </View>

      <SummaryKeyTerms terms={keyTerms} />

      <View style={styles.next}>
        <Text style={styles.meaning}>{status.meaning}</Text>
        {status.next ? (
          <Text style={styles.nextText}>
            <Text style={styles.nextLabel}>Bước tiếp theo: </Text>
            {status.next}
          </Text>
        ) : null}
      </View>

      {action ? (
        <DetailButton
          label={action.label}
          onPress={action.onPress}
          variant={action.urgent ? 'primary' : 'row'}
          icon={action.urgent ? undefined : 'fileText'}
        />
      ) : null}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  head: { gap: Spacing.xs },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  chip: {
    flexShrink: 1,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authNoteBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
  },
  chipText: { fontFamily: FontFamily.semibold, fontSize: 11, lineHeight: 16, color: Colors.authPrimary },
  amount: {
    marginTop: 2,
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 38,
    letterSpacing: -0.3,
    color: Colors.authInk,
    ...tabularNums,
  },
  date: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  next: {
    gap: Spacing.xs,
    paddingTop: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.authBorder,
  },
  meaning: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  nextText: { fontFamily: FontFamily.regular, fontSize: 13.5, lineHeight: 20, color: Colors.authInk },
  nextLabel: { fontFamily: FontFamily.semibold },
});
