import { StyleSheet, Text, View } from 'react-native';
import type { IconName } from '@/constants/icons';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Icon } from '@/components/ui';

export type OutcomeTone = 'success' | 'pending' | 'error';

const LOOK: Record<OutcomeTone, { icon: IconName; background: string; foreground: string }> = {
  success: { icon: 'check', background: Colors.greenBg, foreground: Colors.emerald },
  pending: { icon: 'clock', background: Colors.amberBg, foreground: Colors.amber },
  error: { icon: 'x', background: Colors.redBg, foreground: Colors.red },
};

type Props = {
  tone: OutcomeTone;
  title: string;
  message: string;
  /** Nút hành động bên dưới. */
  children?: React.ReactNode;
};

/** Khối kết quả cuối luồng eKYC: biểu tượng lớn, tiêu đề, thông điệp của server. */
export default function OutcomeView({ tone, title, message, children }: Props) {
  const look = LOOK[tone];
  return (
    <View>
      <View style={styles.head} accessibilityLiveRegion="polite">
        <View style={[styles.badge, { backgroundColor: look.background }]}>
          <Icon name={look.icon} size={48} color={look.foreground} strokeWidth={3} />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.section, marginBottom: Spacing.xxl },
  badge: {
    width: 96,
    height: 96,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: { ...Text_.display, color: Colors.ink, textAlign: 'center' },
  message: { ...Text_.micro, color: Colors.ink2, textAlign: 'center' },
});
