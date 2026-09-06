import { StyleSheet, Text, View } from 'react-native';
import { Card, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_, tabularNums } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import { formatAnnualRate, formatDong } from '@/utils/format';

type RateDirection = 'lower' | 'same' | 'higher';

function getDirection(baseRate: number, finalRate: number): RateDirection {
  if (finalRate < baseRate) return 'lower';
  if (finalRate > baseRate) return 'higher';
  return 'same';
}

const COPY: Record<RateDirection, { title: string; description: string; tone: 'green' | 'blue' | 'amber' }> = {
  lower: {
    title: 'Bạn được giảm lãi suất',
    description: 'Kết quả đánh giá tín dụng cho phép áp dụng mức lãi thấp hơn mức cơ sở ban đầu.',
    tone: 'green',
  },
  same: {
    title: 'Lãi suất được giữ nguyên',
    description: 'Kết quả đánh giá không làm thay đổi mức lãi suất cơ sở bạn đã xem khi nộp hồ sơ.',
    tone: 'blue',
  },
  higher: {
    title: 'Lãi suất được điều chỉnh tăng',
    description: 'Mức lãi mới phản ánh kết quả đánh giá tín dụng và vẫn nằm trong khung đã công bố của sản phẩm.',
    tone: 'amber',
  },
};

/**
 * Giải thích điều khoản trước/sau thẩm định bằng dữ liệu Loan đã chốt.
 * Component không tự tính lãi hay lịch trả và không công khai grade/chi tiết mô hình cho borrower.
 */
export default function PricingChangeNotice({ application }: { application: LoanApplication }) {
  const finalRate = application.finalAnnualInterestRate;
  const finalSchedule = application.finalCalculationSnapshot;
  const initialSchedule = application.calculationSnapshot;

  if (application.status !== 'APPROVED' || finalRate == null) return null;

  const baseRate = application.productSnapshot.annualInterestRate;
  const direction = getDirection(baseRate, finalRate);
  const copy = COPY[direction];

  return (
    <Card style={[styles.card, styles[direction]]}>
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.eyebrow}>KẾT QUẢ ĐIỀU KHOẢN</Text>
          <Text style={styles.title} accessibilityRole="header">{copy.title}</Text>
        </View>
        <Tag tone={copy.tone} small>{direction === 'same' ? 'Không đổi' : 'Đã cập nhật'}</Tag>
      </View>

      <Text style={styles.description}>{copy.description}</Text>

      <View style={styles.rateComparison}>
        <RateCell label="Lúc nộp hồ sơ" value={formatAnnualRate(baseRate)} />
        <Text style={styles.arrow}>→</Text>
        <RateCell label="Áp dụng trong hợp đồng" value={formatAnnualRate(finalRate)} emphasized />
      </View>

      {finalSchedule ? (
        <View style={styles.scheduleComparison}>
          <ComparisonRow
            label="Kỳ trả đầu"
            before={formatDong(initialSchedule.firstInstallment)}
            after={formatDong(finalSchedule.firstInstallment)}
          />
          <ComparisonRow
            label="Tổng tiền lãi"
            before={formatDong(initialSchedule.totalInterest)}
            after={formatDong(finalSchedule.totalInterest)}
          />
          <ComparisonRow
            label="Tổng phải trả"
            before={formatDong(initialSchedule.totalRepayment)}
            after={formatDong(finalSchedule.totalRepayment)}
          />
        </View>
      ) : null}

      <Text style={styles.choice}>
        Hãy đọc lịch trả và toàn bộ hợp đồng bên dưới. Bạn chỉ ký khi đồng ý với mức áp dụng mới;
        nếu không phù hợp, bạn có quyền từ chối hợp đồng.
      </Text>
    </Card>
  );
}

function RateCell({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <View style={[styles.rateCell, emphasized && styles.rateCellEmphasized]}>
      <Text style={styles.rateLabel}>{label}</Text>
      <Text style={[styles.rateValue, emphasized && styles.rateValueEmphasized]}>{value}</Text>
    </View>
  );
}

function ComparisonRow({ label, before, after }: { label: string; before: string; after: string }) {
  return (
    <View style={styles.comparisonRow}>
      <Text style={styles.comparisonLabel}>{label}</Text>
      <View style={styles.comparisonValues}>
        <Text style={styles.beforeValue}>{before}</Text>
        <Text style={styles.smallArrow}>→</Text>
        <Text style={styles.afterValue}>{after}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.lg, borderLeftWidth: 4, marginTop: Spacing.lg },
  lower: { borderLeftColor: Colors.emerald },
  same: { borderLeftColor: Colors.brand },
  higher: { borderLeftColor: Colors.amber },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md },
  headingText: { flex: 1, gap: Spacing.xxs },
  eyebrow: { ...Text_.captionBold, color: Colors.ink3 },
  title: { ...Text_.title, color: Colors.ink },
  description: { ...Text_.micro, color: Colors.ink2, lineHeight: 21 },
  rateComparison: { flexDirection: 'row', alignItems: 'stretch', gap: Spacing.sm },
  rateCell: { flex: 1, gap: Spacing.xs, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.bg },
  rateCellEmphasized: { backgroundColor: Colors.brand50 },
  rateLabel: { ...Text_.caption, color: Colors.ink3 },
  rateValue: { ...Text_.bodyBold, color: Colors.ink2, ...tabularNums },
  rateValueEmphasized: { color: Colors.brand },
  arrow: { ...Text_.bodyBold, color: Colors.brand, alignSelf: 'center' },
  scheduleComparison: { gap: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.line },
  comparisonRow: { gap: Spacing.xs },
  comparisonLabel: { ...Text_.caption, color: Colors.ink3 },
  comparisonValues: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  beforeValue: { ...Text_.micro, color: Colors.ink3, textDecorationLine: 'line-through', ...tabularNums },
  smallArrow: { ...Text_.captionBold, color: Colors.ink3 },
  afterValue: { ...Text_.microBold, color: Colors.ink, ...tabularNums },
  choice: { ...Text_.caption, color: Colors.ink2, lineHeight: 19 },
});
