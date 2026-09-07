import { StyleSheet, Text, View } from 'react-native';
import { Card, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_, tabularNums } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import { formatAnnualRate } from '@/utils/format';

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

      <Text style={styles.choice}>
        Hãy mở bản PDF để đọc lịch trả và toàn bộ điều khoản. Bạn chỉ ký khi đồng ý với mức áp dụng mới;
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
  choice: { ...Text_.caption, color: Colors.ink2, lineHeight: 19 },
});
