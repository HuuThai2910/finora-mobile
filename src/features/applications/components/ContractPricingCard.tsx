import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing, tabularNums } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import { formatAnnualRate } from '@/utils/format';
import { PRICING_CHOICE_NOTES, pricingChangeOf, type PricingChangeCopy } from '../mappers/pricingChange';
import DetailCard from './DetailCard';

const TONES: Record<PricingChangeCopy['tone'], { bg: string; fg: string }> = {
  amber: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  green: { bg: Colors.greenBg, fg: Colors.tagGreenText },
  blue: { bg: Colors.blueBg, fg: Colors.tagBlueText },
};

/**
 * "Kết quả điều khoản" ở màn hợp đồng (mockup 26/09/2026): tiêu đề nói thẳng
 * chiều thay đổi, rồi lãi suất lúc nộp → lãi suất áp dụng cuối. Dữ liệu và điều
 * kiện hiển thị dùng chung `pricingChangeOf` với màn chi tiết hồ sơ.
 *
 * Câu "đã tự tiếp tục vì không bất lợi hơn" chỉ đúng khi Loan tự uỷ quyền; hồ sơ
 * đã tự chấp nhận mức lãi cao hơn thì câu đó sai, nên chỉ hiện ở `AUTO_AUTHORIZED`.
 */
export default function ContractPricingCard({ application }: { application: LoanApplication }) {
  const change = pricingChangeOf(application);
  if (!change) return null;

  const tone = TONES[change.copy.tone];
  const baseText = formatAnnualRate(change.baseRate);
  const finalText = formatAnnualRate(change.finalRate);
  const finalLabel = change.pending ? 'Đề nghị sau thẩm định' : 'Áp dụng cuối';
  const choice = change.pending
    ? PRICING_CHOICE_NOTES.pending
    : application.termsConfirmation?.status === 'AUTO_AUTHORIZED'
      ? PRICING_CHOICE_NOTES.autoContinued
      : null;

  return (
    <DetailCard>
      {/* Nhãn "Đã cập nhật" đứng cùng hàng dòng nhỏ phía trên, để tiêu đề có trọn bề ngang. */}
      <View>
        <View style={styles.top}>
          <Text style={styles.eyebrow} maxFontSizeMultiplier={1.3}>
            KẾT QUẢ ĐIỀU KHOẢN
          </Text>
          <View style={[styles.pill, { backgroundColor: tone.bg }]}>
            <Icon name={change.direction === 'same' ? 'check' : 'info'} size={13} color={tone.fg} strokeWidth={2.4} />
            <Text style={[styles.pillText, { color: tone.fg }]} maxFontSizeMultiplier={1.3}>
              {change.direction === 'same' ? 'Không đổi' : 'Đã cập nhật'}
            </Text>
          </View>
        </View>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          {change.copy.title}
        </Text>
      </View>

      <Text style={styles.body}>{change.copy.description}</Text>

      <View
        style={styles.compare}
        accessible
        accessibilityLabel={`Lãi suất lúc nộp hồ sơ ${baseText}, ${finalLabel.toLowerCase()} ${finalText}.`}
      >
        <RateBox label="Lúc nộp hồ sơ" value={baseText} />
        <Icon name="arrowRight" size={18} color={Colors.authPrimary} />
        <RateBox label={finalLabel} value={finalText} emphasized />
      </View>

      {choice ? <Text style={styles.body}>{choice}</Text> : null}
    </DetailCard>
  );
}

function RateBox({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <View style={[styles.box, emphasized && styles.boxEmphasized]}>
      <Text style={styles.boxLabel} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
      <Text style={[styles.boxValue, emphasized && styles.boxValueEmphasized]} maxFontSizeMultiplier={1.3}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  eyebrow: {
    flexShrink: 1,
    fontFamily: FontFamily.semibold,
    fontSize: 11.5,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Colors.authMuted,
  },
  title: { fontFamily: FontFamily.bold, fontSize: 18, lineHeight: 25, color: Colors.authInk },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  pillText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17 },
  body: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  compare: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  box: {
    flex: 1,
    gap: 2,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceMuted,
  },
  boxEmphasized: { backgroundColor: Colors.tintBlue },
  boxLabel: { fontFamily: FontFamily.regular, fontSize: 11.5, lineHeight: 16, color: Colors.authMuted },
  boxValue: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.authLabel,
    ...tabularNums,
  },
  boxValueEmphasized: { color: Colors.authPrimary },
});
