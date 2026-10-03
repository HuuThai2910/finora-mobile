import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, Spacing } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  /** `outline`: nút phụ viền xanh nền trắng, như "Huỷ" hay "Sửa tiêu chí". */
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  /** Đang xử lý: hiện vòng xoay thay chữ và khoá nút để không bấm lặp. */
  loading?: boolean;
};

/** Cao 48pt như nút chính của các màn đã vẽ lại (≥ 44pt vùng chạm). */
const HEIGHT = 48;

/**
 * Nút của các màn đầu tư: bo tròn hai đầu, nền `authPrimary` như nút chính của luồng vay và màn
 * tài khoản. Biến thể viền dùng cho thao tác phụ để hai nút cạnh nhau không tranh sự chú ý.
 */
export default function InvestButton({ label, onPress, icon, variant = 'primary', disabled = false, loading = false }: Props) {
  const inactive = disabled || loading;
  const outline = variant === 'outline';
  const fg = outline ? Colors.authPrimary : Colors.onDark;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      android_ripple={{ color: outline ? Colors.tintBlue : Colors.onDarkFaint }}
      style={({ pressed }) => [
        styles.button,
        outline ? styles.outline : styles.primary,
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={20} color={fg} /> : null}
          <Text style={[styles.label, { color: fg }]} maxFontSizeMultiplier={1.4}>{label}</Text>
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
  pressed: { opacity: 0.85 },
  inactive: { opacity: 0.45 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  label: { flexShrink: 1, textAlign: 'center', fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 22 },
});
