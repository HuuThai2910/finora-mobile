import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import type { TopUpPhase } from '../mappers/topUp';
import WalletButton from './WalletButton';

type Action = { label: string; onPress: () => void; loading?: boolean; disabled?: boolean };

type Props = {
  phase: Exclude<TopUpPhase, 'pending'>;
  title: string;
  detail: string;
  primary: Action;
  secondary: Action;
};

const LOOK: Record<Props['phase'], { icon: IconName; bg: string; fg: string }> = {
  completed: { icon: 'circleCheck', bg: Colors.tintGreen, fg: Colors.walletHistoryIn },
  failed: { icon: 'circleX', bg: Colors.redBg, fg: Colors.red },
  reconcile: { icon: 'clockAlert', bg: Colors.amberBg, fg: Colors.tagAmberText },
};

/**
 * Thẻ kết quả khi lệnh nạp đã ra khỏi trạng thái chờ: một biểu tượng trạng thái (kèm câu chữ, không
 * chỉ dựa vào màu), câu nói rõ chuyện gì đã xảy ra với số dư, và việc làm tiếp theo.
 */
export default function TopUpOutcomeCard({ phase, title, detail, primary, secondary }: Props) {
  const look = LOOK[phase];
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={[styles.tile, { backgroundColor: look.bg }]}>
        <Icon name={look.icon} size={28} color={look.fg} />
      </View>
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>{title}</Text>
      <Text style={styles.detail} maxFontSizeMultiplier={1.4}>{detail}</Text>
      <View style={styles.actions}>
        <WalletButton {...primary} />
        <WalletButton variant="text" {...secondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  tile: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  title: {
    fontFamily: FontFamily.extrabold,
    fontSize: 20,
    lineHeight: 29,
    letterSpacing: -0.2,
    color: Colors.authInk,
    textAlign: 'center',
  },
  detail: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 21, color: Colors.authMuted, textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: Spacing.xs, marginTop: Spacing.lg },
});
