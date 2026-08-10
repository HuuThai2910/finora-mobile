import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import Icon from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { IconSize, MIN_TOUCH, Radius, Spacing, Text_, tabularNums } from '@/theme';
import { formatDate, formatDong } from '@/utils/format';

type Props = {
  /** Số tiền của kỳ đầu tiên. */
  firstInstallment: number;
  /** Kỳ cao nhất; chỉ nói tới khi khác kỳ đầu (phương thức gốc đều). */
  maximumInstallment: number;
  repaymentLabel: string;
  principal: number;
  interest: number;
  fees: number;
  penalties: number;
  totalRepayment: number;
  expectedDisbursementDate: string;
  periodCount: number;
  /** Hồ sơ là số dự kiến, hợp đồng là số đã chốt. */
  estimate: boolean;
  onOpenSchedule: () => void;
};

/**
 * Toàn bộ phần tiền của một khoản vay gói trong một khối.
 *
 * Trước đây số tiền bị rải ra ba chỗ: kỳ trả ở một thẻ, gốc/lãi/phí ở thẻ "chi
 * phí", ngày giải ngân ở thẻ "mốc thời gian" — trong đó gốc và tổng phải trả
 * đã hiện ở phía trên. Gom lại vừa bỏ được trùng lặp, vừa cho thấy phép cộng
 * gốc + lãi + phí ra tổng, thứ mà ba thẻ rời không thể hiện được.
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

  return (
    <Card style={styles.card}>
      <View>
        <View style={styles.amountRow}>
          <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {formatDong(firstInstallment)}
          </Text>
          <Text style={styles.unit}>{varyingInstallment ? 'kỳ đầu' : 'mỗi kỳ'}</Text>
        </View>
        <Text style={styles.caption}>
          {varyingInstallment
            ? `${repaymentLabel}, kỳ cao nhất ${formatDong(maximumInstallment)}`
            : repaymentLabel}
        </Text>
      </View>

      <View style={styles.breakdown}>
        <Line label="Tiền gốc" value={formatDong(principal)} />
        <Line label="Tiền lãi" value={formatDong(interest)} />
        <Line label="Phí" value={formatDong(fees)} />
        {penalties > 0 ? <Line label="Phạt đang ghi nhận" value={formatDong(penalties)} /> : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {estimate ? 'Tổng phải trả dự kiến' : 'Tổng phải trả'}
          </Text>
          <Text style={styles.totalValue}>{formatDong(totalRepayment)}</Text>
        </View>
      </View>

      <Text style={styles.disbursement}>
        Lịch trả tính từ ngày giải ngân dự kiến {formatDate(expectedDisbursementDate)}.
      </Text>

      <Pressable
        onPress={onOpenSchedule}
        accessibilityRole="button"
        accessibilityLabel={
          periodCount > 0 ? `Xem lịch trả đầy đủ ${periodCount} kỳ` : 'Xem lịch trả từng kỳ'
        }
        style={({ pressed }) => [styles.link, pressed && styles.pressed]}
      >
        <Text style={styles.linkText}>
          {periodCount > 0 ? `Xem lịch trả đầy đủ ${periodCount} kỳ` : 'Xem lịch trả từng kỳ'}
        </Text>
        <Icon name="chevronRight" size={IconSize.xs} color={Colors.brand} />
      </Pressable>
    </Card>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.xl },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.md },
  amount: { ...Text_.figure, color: Colors.ink, flexShrink: 1, ...tabularNums },
  unit: { ...Text_.micro, color: Colors.ink3 },
  caption: { ...Text_.micro, color: Colors.ink2, marginTop: Spacing.xs },
  breakdown: { gap: Spacing.md },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.lg },
  lineLabel: { ...Text_.micro, color: Colors.ink2 },
  lineValue: { ...Text_.micro, color: Colors.ink, ...tabularNums },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  totalLabel: { ...Text_.body, color: Colors.ink },
  totalValue: { ...Text_.bodyBold, color: Colors.ink, ...tabularNums },
  disbursement: { ...Text_.caption, color: Colors.ink3 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    minHeight: MIN_TOUCH,
    paddingHorizontal: Spacing.xl,
    marginHorizontal: -Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.brand50,
  },
  pressed: { opacity: 0.7 },
  linkText: { ...Text_.microBold, color: Colors.brand },
});
