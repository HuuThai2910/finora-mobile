import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, tabularNums } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import { formatAnnualRate } from '@/utils/format';
import { pricingChangeOf, type PricingChange, type PricingChangeCopy } from '../mappers/pricingChange';
import DetailCard from './DetailCard';
import TermsDecision from './TermsDecision';

/** Màu ô icon cạnh tiêu đề theo chiều thay đổi; tông lấy từ `pricingChangeOf`. */
const TONES: Record<PricingChangeCopy['tone'], { badge: string }> = {
  amber: { badge: Colors.amber },
  green: { badge: Colors.emerald },
  blue: { badge: Colors.authPrimary },
};

/** Điều khoản cuối bất lợi hơn lúc nộp: thẻ đổi sang tông vàng và mang luôn phần quyết định. */
const PENDING = { tone: TONES.amber };

/** Một câu thay cho đoạn giải thích dài: vì sao phải quyết định và điều gì xảy ra nếu không trả lời. */
const PENDING_NOTE =
  "Điều khoản vay đã thay đổi theo hướng bất lợi hơn so với khi bạn nộp hồ sơ. Hợp đồng chỉ được lập khi bạn đồng ý.";

/**
 * "Kết quả điều khoản" theo mockup 26/09/2026: lãi suất lúc đăng ký → lãi suất sau thẩm định, kèm lời
 * giải thích khi lãi đổi (giữ nguyên thì không). Khi điều khoản cần người vay quyết định, cùng thẻ này
 * hiện hạn phản hồi và hai nút chấp nhận/từ chối, để người vay xem mức lãi và quyết định ở một chỗ.
 * Dữ liệu và điều kiện hiển thị lấy từ `pricingChangeOf`.
 */
export default function PricingResultCard({
  application,
  onDone,
}: {
  application: LoanApplication;
  /** Gọi sau khi chấp nhận/từ chối điều khoản để màn tải lại hồ sơ. */
  onDone: () => void;
}) {
  const change = pricingChangeOf(application);
  const pending = application.termsConfirmation?.status === 'PENDING';
  if (!change && !pending) return null;

  const tone = pending ? PENDING.tone : TONES[change?.copy.tone ?? 'blue'];
  const note = pending ? PENDING_NOTE : change?.copy.notice?.description ?? null;

  return (
    <DetailCard
      title="Kết quả điều khoản"
      badge={{ icon: pending ? 'alert' : 'percent', color: tone.badge }}
    >
      {change ? <RateCompare change={change} /> : null}

      {note ? (
        <View style={styles.info}>
          <Icon name="info" size={16} color={pending ? Colors.tagAmberText : Colors.authPrimary} />
          <Text style={styles.note}>{note}</Text>
        </View>
      ) : null}

      <TermsDecision application={application} onDone={onDone} />
    </DetailCard>
  );
}

function RateCompare({ change }: { change: PricingChange }) {
  const baseText = formatAnnualRate(change.baseRate);
  const finalText = formatAnnualRate(change.finalRate);
  const finalLabel = change.pending ? 'Lãi suất đề nghị' : 'Lãi suất được duyệt';
  const { notice } = change.copy;
  return (
    <View
      style={styles.compare}
      accessible
      accessibilityLabel={`${notice ? `${notice.title}. ` : ''}Lãi suất khi đăng ký ${baseText}, ${finalLabel.toLowerCase()} ${finalText}.`}
    >
      <RateBox label="Lãi suất khi đăng ký" value={baseText} />
      <Icon name="arrowRight" size={18} color={Colors.authPrimary} />
      <RateBox label={finalLabel} value={finalText} emphasized />
    </View>
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
  note: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
