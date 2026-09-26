import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing, tabularNums } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import { formatAnnualRate } from '@/utils/format';
import { PRICING_CHOICE_NOTES, pricingChangeOf, type PricingChangeCopy } from '../mappers/pricingChange';
import DetailCard from './DetailCard';

/** Ô icon, nền và chữ của nhãn theo chiều thay đổi; tông lấy từ `pricingChangeOf`. */
const TONES: Record<PricingChangeCopy['tone'], { badge: string; bg: string; fg: string }> = {
  amber: { badge: Colors.amber, bg: Colors.amberBg, fg: Colors.tagAmberText },
  green: { badge: Colors.emerald, bg: Colors.greenBg, fg: Colors.tagGreenText },
  blue: { badge: Colors.authPrimary, bg: Colors.blueBg, fg: Colors.tagBlueText },
};

/**
 * "Kết quả điều khoản" theo mockup 26/09/2026: lãi suất lúc đăng ký → lãi suất
 * sau thẩm định, kèm lời giải thích. Cùng dữ liệu và điều kiện hiển thị với
 * `ContractPricingCard` của màn hợp đồng qua `pricingChangeOf`.
 *
 * Câu "đã tự tiếp tục vì không bất lợi hơn" chỉ đúng khi Loan tự uỷ quyền; hồ sơ
 * đã chấp nhận điều khoản bất lợi hơn thì câu đó sai, nên chỉ hiện ở
 * `AUTO_AUTHORIZED`.
 */
export default function PricingResultCard({ application }: { application: LoanApplication }) {
  const change = pricingChangeOf(application);
  if (!change) return null;

  const tone = TONES[change.copy.tone];
  const baseText = formatAnnualRate(change.baseRate);
  const finalText = formatAnnualRate(change.finalRate);
  const finalLabel = change.pending ? 'Lãi suất đề nghị' : 'Lãi suất được duyệt';
  const choice = change.pending
    ? PRICING_CHOICE_NOTES.pending
    : application.termsConfirmation?.status === 'AUTO_AUTHORIZED'
      ? PRICING_CHOICE_NOTES.autoContinued
      : null;

  return (
    <DetailCard
      title="Kết quả điều khoản"
      badge={{ icon: 'percent', color: tone.badge }}
      right={
        <View style={[styles.pill, { backgroundColor: tone.bg }]}>
          <Text style={[styles.pillText, { color: tone.fg }]} maxFontSizeMultiplier={1.4}>
            {change.direction === 'same' ? 'Không đổi' : 'Đã cập nhật'}
          </Text>
        </View>
      }
    >
      <View
        style={styles.compare}
        accessible
        accessibilityLabel={`${change.copy.title}. Lãi suất khi đăng ký ${baseText}, ${finalLabel.toLowerCase()} ${finalText}.`}
      >
        <RateBox label="Lãi suất khi đăng ký" value={baseText} />
        <Icon name="arrowRight" size={18} color={Colors.authPrimary} />
        <RateBox label={finalLabel} value={finalText} emphasized />
      </View>

      <View style={styles.info}>
        <Icon name="info" size={16} color={Colors.authPrimary} />
        <View style={styles.infoText}>
          <Text style={styles.note}>{change.copy.description}</Text>
          {choice ? <Text style={styles.note}>{choice}</Text> : null}
        </View>
      </View>
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
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17 },
  // Khe hẹp quanh mũi tên để "Lãi suất khi đăng ký" và "13,00%/năm" vẫn một dòng ở màn 360pt.
  compare: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  box: {
    flex: 1,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 10,
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
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  infoText: { flex: 1, gap: Spacing.xs },
  note: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
