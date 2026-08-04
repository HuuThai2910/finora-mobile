import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, MIN_TOUCH, Radius, Spacing } from '@/theme';
import Icon from './Icon';
import type { IconName } from '@/constants/icons';

export type ButtonVariant = 'brand' | 'emerald' | 'navyPill' | 'outline' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<
  ButtonVariant,
  { bg: string; fg: string; border?: string; radius: number }
> = {
  brand: { bg: Colors.brand, fg: Colors.onDark, radius: Radius.lg },
  emerald: { bg: Colors.emerald, fg: Colors.onDark, radius: Radius.lg },
  navyPill: { bg: Colors.navy, fg: Colors.onDark, radius: Radius.pill },
  outline: { bg: 'transparent', fg: Colors.ink2, border: Colors.line, radius: Radius.lg },
  danger: { bg: 'transparent', fg: Colors.red, border: Colors.red, radius: Radius.lg },
};

/**
 * Các nút trong mockup được viết inline với 5 kiểu lặp đi lặp lại; gom lại ở đây.
 * Chiều cao tối thiểu 44pt theo Apple HIG. Trạng thái nhấn đổi độ mờ, không
 * đổi kích thước để không làm xô lệch bố cục xung quanh.
 */
export default function Button({
  label,
  onPress,
  variant = 'brand',
  icon,
  loading = false,
  disabled = false,
  style,
}: Props) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderRadius: v.radius,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border,
        },
        pressed && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={v.fg} />
        ) : (
          <>
            {icon ? <Icon name={icon} size={FontSize.title} color={v.fg} /> : null}
            <Text style={[styles.label, { color: v.fg }]}>{label}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  label: { fontFamily: FontFamily.bold, fontSize: FontSize.title },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 },
});
