import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import type { Withdrawal } from '@/types/wallet';
import {
  isFinalWithdrawal,
  withdrawalOutcome,
  withdrawalStatusView,
  type WithdrawalPhase,
} from '../mappers/withdrawal';
import WalletButton from './WalletButton';
import WithdrawalStatusPill from './WithdrawalStatusPill';

type Action = { label: string; onPress: () => void; loading?: boolean };

type Props = {
  withdrawal: Withdrawal;
  /** Provider giả lập: câu chữ không được ngụ ý đã có tiền thật chuyển tới ngân hàng. */
  simulated: boolean;
  /** Màn đang tự hỏi lại trạng thái theo chu kỳ. */
  watching: boolean;
  primary?: Action;
  secondary: Action;
};

const LOOK: Record<WithdrawalPhase, { icon: IconName; bg: string; fg: string }> = {
  pending: { icon: 'clock', bg: Colors.tintBlue, fg: Colors.authPrimary },
  reconcile: { icon: 'clockAlert', bg: Colors.amberBg, fg: Colors.tagAmberText },
  completed: { icon: 'circleCheck', bg: Colors.tintGreen, fg: Colors.walletHistoryIn },
  failed: { icon: 'circleX', bg: Colors.redBg, fg: Colors.red },
};

/**
 * Thẻ trạng thái của một lệnh rút: biểu tượng và nhãn trạng thái (kèm chữ, không chỉ dựa vào màu), câu nói rõ chuyện
 * gì đã xảy ra với tiền trong ví, dòng hoàn tiền khi thất bại, việc theo dõi đang chạy hay đã dừng, và việc làm tiếp.
 */
export default function WithdrawalStatusCard({ withdrawal, simulated, watching, primary, secondary }: Props) {
  const status = withdrawalStatusView(withdrawal.status);
  const look = LOOK[status.phase];
  const outcome = withdrawalOutcome(withdrawal, simulated);
  const final = isFinalWithdrawal(withdrawal.status);

  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={styles.head}>
        <View style={[styles.tile, { backgroundColor: look.bg }]}>
          <Icon name={look.icon} size={26} color={look.fg} />
        </View>
        <WithdrawalStatusPill status={status} />
      </View>
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
        {outcome.title}
      </Text>
      <Text style={styles.detail} maxFontSizeMultiplier={1.4}>{outcome.detail}</Text>

      {outcome.refund ? (
        <View style={styles.refund}>
          <Icon name="wallet" size={18} color={Colors.walletHistoryIn} />
          <Text style={styles.refundText} maxFontSizeMultiplier={1.4}>{outcome.refund}</Text>
        </View>
      ) : null}

      {watching ? (
        <View style={styles.watch}>
          <ActivityIndicator size="small" color={Colors.authPrimary} />
          <Text style={styles.watchText} maxFontSizeMultiplier={1.4}>Đang tự cập nhật trạng thái…</Text>
        </View>
      ) : !final ? (
        <Text style={styles.watchText} maxFontSizeMultiplier={1.4}>
          Đã dừng tự cập nhật. Bấm “Kiểm tra lại” để xem trạng thái mới nhất.
        </Text>
      ) : null}

      <View style={styles.actions}>
        {primary ? <WalletButton {...primary} /> : null}
        <WalletButton variant="text" {...secondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  tile: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FontFamily.extrabold, fontSize: 20, lineHeight: 29, letterSpacing: -0.2, color: Colors.authInk },
  detail: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 21, color: Colors.authMuted },
  refund: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.tintGreen,
  },
  refundText: { flex: 1, fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.walletHistoryIn },
  watch: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  watchText: { flexShrink: 1, fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  actions: { gap: Spacing.xs, marginTop: Spacing.sm },
});
