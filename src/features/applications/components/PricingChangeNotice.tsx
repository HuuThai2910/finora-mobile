import { StyleSheet, Text, View } from 'react-native';
import { Card, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_, tabularNums } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import { formatAnnualRate } from '@/utils/format';
import { PRICING_CHOICE_NOTES, pricingChangeOf } from '../mappers/pricingChange';

/**
 * Giải thích điều khoản trước/sau thẩm định bằng dữ liệu Loan đã chốt.
 * Component không tự tính lãi hay lịch trả và không công khai grade/chi tiết mô hình cho borrower.
 * Câu chữ và điều kiện hiển thị nằm ở `pricingChangeOf` để màn chi tiết hồ sơ
 * (vẽ theo mockup mới) và màn hợp đồng luôn nói cùng một điều.
 */
export default function PricingChangeNotice({ application }: { application: LoanApplication }) {
  const change = pricingChangeOf(application);
  if (!change) return null;

  const { baseRate, finalRate, direction, copy, pending } = change;

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
        <RateCell
          label={pending ? 'Đề nghị sau thẩm định' : 'Áp dụng cuối'}
          value={formatAnnualRate(finalRate)}
          emphasized
        />
      </View>

      <Text style={styles.choice}>
        {pending ? PRICING_CHOICE_NOTES.pending : PRICING_CHOICE_NOTES.autoContinued}
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
