import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';

type Props = {
  icon: IconName;
  danger?: boolean;
  title: string;
  hint: string;
  action?: { label: string; onPress: () => void };
};

/**
 * Thẻ trạng thái lỗi/trống của các màn đầu tư: nằm trong thẻ trắng để không chìm vào nền sóng, và
 * chỉ ra việc làm tiếp theo nếu có.
 */
export default function InvestStatusCard({ icon, danger = false, title, hint, action }: Props) {
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={[styles.tile, { backgroundColor: danger ? Colors.redBg : Colors.tintBlue }]}>
        <Icon name={icon} size={26} color={danger ? Colors.red : Colors.authPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xxl,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  tile: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  title: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk, textAlign: 'center' },
  hint: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted, textAlign: 'center' },
  button: {
    minHeight: MIN_TOUCH,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  buttonText: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.onDark },
});
