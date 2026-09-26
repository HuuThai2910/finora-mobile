import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, Radius, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Đang xử lý: hiện vòng xoay thay chữ và khoá nút để không bấm lặp. */
  loading?: boolean;
};

/** Cao 48pt như nút chính của nhóm màn tài khoản (≥ 44pt vùng chạm). */
const HEIGHT = 48;

/**
 * Nút chính của các bước nhập khoản vay: bo tròn hai đầu, nền `authPrimary`,
 * mũi tên nằm ngay sau chữ (cả cụm căn giữa) như mockup. Tự dựng trong feature
 * vì `Button` dùng chung đặt mũi tên sát mép phải.
 */
export default function LoanPrimaryButton({ label, onPress, disabled = false, loading = false }: Props) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      android_ripple={{ color: Colors.onDarkFaint }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, inactive && styles.inactive]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.onDark} />
      ) : (
        <View style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Icon name="arrowRight" size={IconSize.xs} color={Colors.onDark} strokeWidth={2.2} />
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
    backgroundColor: Colors.authPrimary,
  },
  pressed: { opacity: 0.85 },
  inactive: { opacity: 0.45 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  label: {
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.onDark,
  },
});
