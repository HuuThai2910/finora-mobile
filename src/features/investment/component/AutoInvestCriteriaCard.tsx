import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { AutoInvestConfig } from '@/types/invest';
import { formatDong, formatPercentValue } from '@/utils/format';
import { GRADE_OPTIONS, digitsOnly, groupDigits, type Draft, type DraftErrors } from '../autoInvestDraft';
import GradePicker from './GradePicker';
import InvestButton from './InvestButton';
import InvestField from './InvestField';

type Props = {
  saved: AutoInvestConfig;
  /** Có bản nháp là đang sửa; null là đang xem. */
  draft: Draft | null;
  errors: DraftErrors;
  saving: boolean;
  onEdit: () => void;
  onChange: (patch: Partial<Draft>) => void;
  onSave: () => void;
  onCancel: () => void;
};

/**
 * Tiêu chí khớp của Auto-Invest trong một thẻ trắng: xem thì là bốn dòng nhãn–giá trị kèm nút sửa,
 * sửa thì chính thẻ đó thành form — không mở màn khác, để người dùng thấy ngay mình đang đổi gì.
 */
export default function AutoInvestCriteriaCard({ saved, draft, errors, saving, onEdit, onChange, onSave, onCancel }: Props) {
  if (!draft) {
    const rows = [
      { label: 'Hạng tín dụng', value: saved.grades.join(', ') || 'Chưa chọn' },
      { label: 'Lãi suất tối thiểu', value: `${formatPercentValue(saved.minAnnualRate)}/năm` },
      { label: 'Kỳ hạn tối đa', value: `${saved.maxTermMonths} tháng` },
      { label: 'Mỗi khoản vay', value: formatDong(saved.amountPerLoan) },
    ];
    return (
      <View style={styles.card}>
        {rows.map((r, i) => (
          <View key={r.label} style={[styles.row, i > 0 && styles.divider]}>
            <Text style={styles.rowLabel} maxFontSizeMultiplier={1.4}>{r.label}</Text>
            <Text style={styles.rowValue} maxFontSizeMultiplier={1.4}>{r.value}</Text>
          </View>
        ))}
        <View style={styles.actions}>
          <InvestButton label="Sửa tiêu chí" variant="outline" icon="pen" onPress={onEdit} disabled={saving} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.form]}>
      <View style={styles.group}>
        <Text style={styles.groupLabel} maxFontSizeMultiplier={1.4}>Hạng tín dụng</Text>
        <GradePicker
          options={[...new Set([...GRADE_OPTIONS, ...draft.grades])]}
          value={draft.grades}
          onChange={grades => onChange({ grades })}
        />
        {errors.grades ? <Text style={styles.error}>{errors.grades}</Text> : null}
      </View>

      <InvestField
        label="Lãi suất tối thiểu"
        suffix="%/năm"
        value={draft.minRate}
        onChangeText={minRate => onChange({ minRate })}
        keyboardType="decimal-pad"
        error={errors.minRate}
      />
      <InvestField
        label="Kỳ hạn tối đa"
        suffix="tháng"
        value={draft.maxTerm}
        onChangeText={maxTerm => onChange({ maxTerm: digitsOnly(maxTerm).slice(0, 3) })}
        keyboardType="number-pad"
        error={errors.maxTerm}
      />
      <InvestField
        label="Số tiền mỗi khoản vay"
        suffix="đ"
        value={draft.amount}
        onChangeText={amount => {
          const digits = digitsOnly(amount).slice(0, 12);
          onChange({ amount: digits ? groupDigits(Number(digits)) : '' });
        }}
        keyboardType="number-pad"
        helper="Làm tròn xuống theo mệnh giá Note khi khớp; khoản còn ít vốn hơn thì lấy phần còn lại."
        error={errors.amount}
      />

      <View style={styles.formActions}>
        <View style={styles.flex}>
          <InvestButton label="Huỷ" variant="outline" onPress={onCancel} disabled={saving} />
        </View>
        <View style={styles.flex}>
          <InvestButton label="Lưu tiêu chí" onPress={onSave} loading={saving} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  form: { gap: Spacing.xl, paddingVertical: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, minHeight: 48 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  rowLabel: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk, ...tabularNums },
  actions: { paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  group: { gap: Spacing.sm },
  groupLabel: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authLabel },
  error: { fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 17, color: Colors.tagRedText },
  formActions: { flexDirection: 'row', gap: Spacing.md },
  flex: { flex: 1 },
});
