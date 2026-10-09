import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Radius, Spacing } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  /**
   * `primary`: nút chính nền xanh. `outline`: thao tác phụ viền xanh nền trắng. `text`: lối thoát
   * nhẹ như "Về ví" dưới nút chính, không tranh sự chú ý.
   */
  variant?: 'primary' | 'outline' | 'text';
  disabled?: boolean;
  /** Đang xử lý: hiện vòng xoay thay chữ và khoá nút để không bấm lặp. */
  loading?: boolean;
};

/** Cao 48pt như nút chính của các màn đã vẽ lại (≥ 44pt vùng chạm). */
const HEIGHT = 48;

/**
 * Nút của các màn ví: bo tròn hai đầu, nền `authPrimary` như nút chính ở trang chủ, luồng vay và
 * màn đầu tư, để màn nạp tiền không lạc tông với phần còn lại của app.
 */
export default function WalletButton({ label, onPress, icon, variant = 'primary', disabled = false, loading = false }: Props) {
  const inactive = disabled || loading;
  const fg = variant === 'primary' ? Colors.onDark : Colors.authPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      android_ripple={variant === 'text' ? undefined : { color: variant === 'outline' ? Colors.tintBlue : Colors.onDarkFaint }}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={20} color={fg} /> : null}
          <Text style={[styles.label, variant === 'text' && styles.textLabel, { color: fg }]} maxFontSizeMultiplier={1.4}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
  },
  primary: { backgroundColor: Colors.authPrimary },
  outline: { borderWidth: 1.5, borderColor: Colors.authPrimary, backgroundColor: Colors.card },
  text: { minHeight: MIN_TOUCH, alignSelf: 'center' },
  pressed: { opacity: 0.85 },
  inactive: { opacity: 0.45 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  label: { flexShrink: 1, textAlign: 'center', fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 22 },
  textLabel: { fontSize: 15, lineHeight: 21 },
});
