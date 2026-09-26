import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, tabularNums } from '@/theme';
import { formatDate, formatDong } from '@/utils/format';
import DetailButton from './DetailButton';
import DetailCard from './DetailCard';

type Props = {
  /** Số tiền của kỳ đầu tiên. */
  firstInstallment: number;
  /** Kỳ cao nhất; chỉ nói tới khi khác kỳ đầu. */
  maximumInstallment: number;
  repaymentLabel: string;
  principal: number;
  interest: number;
  fees: number;
  penalties: number;
  totalRepayment: number;
  expectedDisbursementDate: string;
  periodCount: number;
  /** Hồ sơ chưa duyệt là số dự kiến, đã duyệt là lịch theo điều khoản sau thẩm định. */
  estimate: boolean;
  onOpenSchedule: () => void;
};

/**
 * Lịch trả của hồ sơ là snapshot, không phải lịch vận hành sau giải ngân, nên
 * luôn đi kèm câu nói rõ đó là số nào. Câu này trước đây là hộp thông báo riêng
 * dưới thẻ; nay nằm cuối thẻ ở cỡ chữ phụ để không tranh chỗ với số tiền.
 */
const NOTES = {
  estimate:
    'Đây là số dự kiến tính lúc bạn nộp hồ sơ. Lịch trả chính thức chỉ hình thành sau khi hợp đồng có hiệu lực và khoản vay được giải ngân.',
  approved:
    'Đây là lịch theo điều khoản sau thẩm định và là cơ sở lập hợp đồng. Ngày trả thực tế có thể dịch theo ngày giải ngân.',
} as const;

/**
 * "Thông tin thanh toán" (mockup 26/09/2026): toàn bộ phần tiền của khoản vay
 * trong một thẻ, số phải trả mỗi kỳ in lớn, rồi gốc + lãi + phí cộng ra tổng.
 * Frontend chỉ trình bày số Loan Service đã tính, không tự tính lại.
 */
export default function RepaymentSummary({
  firstInstallment,
  maximumInstallment,
  repaymentLabel,
  principal,
  interest,
  fees,
  penalties,
  totalRepayment,
  expectedDisbursementDate,
  periodCount,
  estimate,
  onOpenSchedule,
}: Props) {
  const varyingInstallment = maximumInstallment > firstInstallment;
  const scheduleLabel =
    periodCount > 0 ? `Xem lịch trả đầy đủ ${periodCount} kỳ` : 'Xem lịch trả từng kỳ';

  return (
    <DetailCard title="Thông tin thanh toán" icon="wallet">
      <View>
        <View style={styles.amountRow}>
          <Text style={styles.amount} maxFontSizeMultiplier={1.2}>
            {formatDong(firstInstallment)}
          </Text>
          <Text style={styles.unit}>{varyingInstallment ? '/ kỳ đầu' : '/ kỳ'}</Text>
        </View>
        <Text style={styles.caption}>
          {varyingInstallment
            ? `${repaymentLabel}, kỳ cao nhất ${formatDong(maximumInstallment)}`
            : repaymentLabel}
        </Text>
      </View>

      <View style={styles.figures}>
        <Figure label="Tiền gốc" value={formatDong(principal)} />
        <Figure label="Tiền lãi" value={formatDong(interest)} divided />
        <Figure label="Phí" value={formatDong(fees)} divided />
      </View>

      <View style={styles.totals}>
        {penalties > 0 ? (
          <View style={styles.line}>
            <Text style={styles.lineLabel}>Phạt đang ghi nhận</Text>
            <Text style={styles.lineValue}>{formatDong(penalties)}</Text>
          </View>
        ) : null}
        <View style={styles.line}>
          <Text style={styles.totalLabel}>{estimate ? 'Tổng phải trả dự kiến' : 'Tổng phải trả'}</Text>
          <Text style={styles.totalValue} maxFontSizeMultiplier={1.3}>
            {formatDong(totalRepayment)}
          </Text>
        </View>
        <Text style={styles.fine}>
          Lịch trả tính từ ngày giải ngân dự kiến {formatDate(expectedDisbursementDate)}.
        </Text>
        <Text style={styles.fine}>{estimate ? NOTES.estimate : NOTES.approved}</Text>
      </View>

      <DetailButton
        label={scheduleLabel}
        variant="row"
        icon="calendarCheck"
        onPress={onOpenSchedule}
      />
    </DetailCard>
  );
}

function Figure({ label, value, divided = false }: { label: string; value: string; divided?: boolean }) {
  return (
    <View
      style={[styles.figure, divided && styles.figureDivided]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.figureValue} maxFontSizeMultiplier={1.3}>
        {value}
      </Text>
      <Text style={styles.figureLabel} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  amountRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: Spacing.md },
  amount: {
    fontFamily: FontFamily.extrabold,
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: Colors.authInk,
    ...tabularNums,
  },
  unit: { fontFamily: FontFamily.regular, fontSize: 15, lineHeight: 21, color: Colors.authMuted },
  caption: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  // Mỗi cột rộng theo con số của nó rồi chia đều phần dư: số tiền tỷ đồng vẫn
  // nằm trọn một dòng thay vì bị ép vào một phần ba bề ngang.
  figures: { flexDirection: 'row' },
  figure: { flexGrow: 1, flexShrink: 1, flexBasis: 'auto', gap: 2, paddingRight: Spacing.md },
  figureDivided: {
    paddingLeft: 10,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.authBorder,
  },
  figureValue: {
    fontFamily: FontFamily.bold,
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.authInk,
    ...tabularNums,
  },
  figureLabel: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  totals: {
    gap: 6,
    paddingTop: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.authBorder,
  },
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: Spacing.lg,
  },
  lineLabel: { fontFamily: FontFamily.regular, fontSize: 13.5, lineHeight: 20, color: Colors.authLabel },
  lineValue: {
    fontFamily: FontFamily.semibold,
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.authInk,
    ...tabularNums,
  },
  totalLabel: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 22, color: Colors.authInk },
  totalValue: {
    fontFamily: FontFamily.extrabold,
    fontSize: 19,
    lineHeight: 27,
    color: Colors.authInk,
    ...tabularNums,
  },
  fine: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 18, color: Colors.authMuted },
});
