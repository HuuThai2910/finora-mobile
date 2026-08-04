import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, Radius, Spacing, Text_, tabularNums } from '@/theme';
import Icon from '@/components/ui/Icon';
import type { IconName } from '@/constants/icons';

export type BalanceAction = { icon: IconName; label: string; onPress: () => void };

type Props = {
  /** Nhãn nhỏ phía trên, ví dụ "SỐ DƯ VÍ". */
  label: string;
  /** Giá trị đã format sẵn. */
  value: string;
  /** Bốn nút tắt bên dưới (mockup luôn dùng đúng 4). */
  actions?: readonly BalanceAction[];
  /** Dòng số liệu phụ thay cho nút tắt (dùng ở màn Danh mục đầu tư). */
  meta?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** `.p-balance` + `.p-actions` — thẻ gradient `navy → brand`. */
export default function BalanceCard({ label, value, actions, meta, style }: Props) {
  return (
    <LinearGradient
      colors={[Colors.navy, Colors.brand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} accessibilityLabel={`${label}: ${value}`}>
        {value}
      </Text>

      {meta}

      {actions?.length ? (
        <View style={styles.actions}>
          {actions.map(a => (
            <Pressable
              key={a.label}
              onPress={a.onPress}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <View style={styles.actionIcon}>
                <Icon name={a.icon} size={IconSize.md} color={Colors.onDark} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.xl, padding: Spacing.xxl },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    letterSpacing: 0.6,
    color: Colors.onDarkMuted,
  },
  value: { ...Text_.display, color: Colors.onDark, marginTop: 2, ...tabularNums },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xl },
  action: { alignItems: 'center', flex: 1, gap: Spacing.sm },
  pressed: { opacity: 0.65 },
  actionIcon: {
    width: 57,
    height: 57,
    borderRadius: Radius.lg,
    backgroundColor: Colors.onDarkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    color: Colors.onDarkMuted,
  },
});
