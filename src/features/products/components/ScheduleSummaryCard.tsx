import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, SoftShadow, Spacing, lh, tabularNums } from '@/theme';
import type { ScheduleSummaryView } from '../mappers/repaymentSchedule';
import { LOAN_STEP_DESIGN_WIDTH, LOAN_STEP_MAX_WIDTH } from '../constant';

type Props = {
  summary: ScheduleSummaryView;
};

/** Cỡ số ở hai ô tổng khi có một tổng phải ghi đủ số đồng. */
const EXACT_TOTAL_SIZE = 15;

/**
 * Thẻ tóm tắt của bước 2/3: số tiền vay, kỳ hạn + lãi suất, hai ô tổng trả /
 * tổng lãi và ba dòng kỳ đầu, kỳ cao nhất, phương thức trả. Mọi con số đến từ
 * preview của backend, thẻ chỉ bày ra.
 */
export default function ScheduleSummaryCard({ summary }: Props) {
  // Ô chỉ rộng nửa thẻ: cỡ số co theo cột (không phóng quá cỡ mockup) để vừa một
  // dòng ở máy 360pt. Tổng không tròn chục nghìn phải ghi đủ số đồng ("113.527.000 đ",
  // dài gần gấp rưỡi "53,45 triệu") nên hạ cỡ; hai ô luôn cùng cỡ để vẫn thành cặp.
  const { width } = useWindowDimensions();
  const unit = Math.min(Math.min(width, LOAN_STEP_MAX_WIDTH) / LOAN_STEP_DESIGN_WIDTH, 1);
  const exact = summary.totalRepayment.exact || summary.totalInterest.exact;
  const valueSize = (exact ? EXACT_TOTAL_SIZE : FontSize.title) * unit;

  return (
    <View style={styles.card}>
      <View
        accessible
        accessibilityLabel={`Tổng số tiền vay ${summary.amount}. ${summary.spokenTerms}. Kỳ đầu ${summary.firstInstallment}`}
      >
        <Text style={styles.eyebrow}>Tổng số tiền vay</Text>
        <Text style={styles.amount}>{summary.amount}</Text>
        <Text style={styles.meta}>{summary.terms}</Text>
        <Text style={styles.meta}>kỳ đầu {summary.firstInstallment}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.tiles}>
        <TotalTile label="Tổng trả" value={summary.totalRepayment.text} tone="blue" size={valueSize} />
        <TotalTile label="Tổng lãi" value={summary.totalInterest.text} tone="green" size={valueSize} />
      </View>

      <View style={styles.rows}>
        <SummaryRow label="Kỳ đầu trả" value={summary.firstInstallment} />
        <SummaryRow label="Kỳ cao nhất" value={summary.maximumInstallment} divided />
        <SummaryRow label="Phương thức trả" value={summary.method} divided />
      </View>
    </View>
  );
}

type TotalTileProps = {
  label: string;
  value: string;
  tone: 'blue' | 'green';
  /** Cỡ số, do thẻ tính chung cho cả hai ô. */
  size: number;
};

function TotalTile({ label, value, tone, size }: TotalTileProps) {
  const blue = tone === 'blue';
  return (
    <View
      style={[styles.tile, blue ? styles.tileBlue : styles.tileGreen]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.tileLabel}>{label}</Text>
      <Text
        style={[
          styles.tileValue,
          { fontSize: size, lineHeight: lh(size, 1.4) },
          blue ? styles.valueBlue : styles.valueGreen,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function SummaryRow({ label, value, divided = false }: { label: string; value: string; divided?: boolean }) {
  return (
    <View style={[styles.row, divided && styles.rowDivided]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xs,
    ...SoftShadow.card,
  },
  // Nhãn viết thường trong mã, in hoa bằng style: trình đọc màn hình đọc như chữ thường, không đánh vần.
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.authMuted,
  },
  amount: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.extrabold,
    fontSize: 28,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: Colors.authInk,
    ...tabularNums,
  },
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authMuted,
    ...tabularNums,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.rowDivider,
    marginVertical: Spacing.lg,
  },
  tiles: { flexDirection: 'row', gap: Spacing.md },
  tile: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: Spacing.xxs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
  },
  tileBlue: { backgroundColor: Colors.tintBlue },
  tileGreen: { backgroundColor: Colors.tintGreen },
  tileLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.authMuted,
  },
  // Số viết gọn ("53,45 triệu") vừa một dòng; khi phải ghi đủ số đồng mà ô hẹp
  // thì cho xuống dòng chứ không cắt, vì đây là con số người vay phải trả.
  tileValue: {
    fontFamily: FontFamily.bold,
    textAlign: 'center',
    ...tabularNums,
  },
  valueBlue: { color: Colors.authPrimary },
  valueGreen: { color: Colors.scheduleGreenText },
  rows: { marginTop: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    minHeight: 36,
    paddingVertical: Spacing.sm,
  },
  rowDivided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.rowDivider },
  rowLabel: {
    flexShrink: 1,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authMuted,
  },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authInk,
    ...tabularNums,
  },
});
