import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Radius, Spacing } from '@/theme';

type Variant = 'primary' | 'row' | 'outline' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  /**
   * `primary`: việc chính người vay cần làm. `row`: dòng nền xanh nhạt có mũi
   * tên như "Xem lịch trả đầy đủ" của mockup, cho lối đi tiếp không gấp.
   * `outline`/`danger`: lựa chọn phụ và hành động không hoàn tác.
   */
  variant?: Variant;
  /** Icon đứng trước nhãn. */
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Nhãn đọc cụ thể hơn chữ trên nút, khi chữ trên nút đã rút gọn. */
  accessibilityLabel?: string;
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: Colors.authPrimary, fg: Colors.onDark, border: Colors.authPrimary },
  row: { bg: Colors.tintBlue, fg: Colors.authPrimary, border: Colors.tintBlue },
  outline: { bg: Colors.card, fg: Colors.authInk, border: Colors.authBorder },
  danger: { bg: Colors.card, fg: Colors.red, border: Colors.tagRedBorder },
};

/**
 * Nút của màn chi tiết hồ sơ theo bộ mockup mới (màu `authPrimary`, bo tròn hai
 * đầu như nút ở các màn tài khoản). `Button` dùng chung vẫn giữ kiểu cũ cho các
 * màn chưa vẽ lại, nên không đổi trực tiếp ở đó.
 */
export default function DetailButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  accessibilityLabel,
}: Props) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;
  const isRow = variant === 'row';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        isRow ? styles.row : styles.pill,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={20} color={v.fg} /> : null}
          <Text style={[styles.label, isRow && styles.rowLabel, { color: v.fg }]}>{label}</Text>
          {isRow ? <Icon name="chevronRight" size={18} color={v.fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
  },
  pill: {
    justifyContent: 'center',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 10,
  },
  row: { borderRadius: 12, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  label: {
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: FontFamily.semibold,
    fontSize: 15,
    lineHeight: 21,
  },
  // Nhãn dài (font lớn) xuống dòng trong phần giữa, mũi tên vẫn nằm sát mép phải.
  rowLabel: { flex: 1, textAlign: 'left', fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.75 },
  inactive: { opacity: 0.5 },
});
