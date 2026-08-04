import { Pressable, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MIN_TOUCH, Radius, Spacing } from '@/theme';
import Icon from './Icon';

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  children: React.ReactNode;
};

/**
 * Ô xác nhận — vùng chạm phủ cả ô lẫn phần chữ.
 * Dùng ở màn đăng ký (đồng ý điều khoản) và màn tạo hồ sơ vay (xác nhận đã xem
 * công bố lãi suất).
 */
export default function Checkbox({ checked, onChange, label, children }: Props) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Icon name="check" size={16} color={Colors.onDark} strokeWidth={3} /> : null}
      </View>
      <View style={styles.text}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    minHeight: MIN_TOUCH,
    paddingVertical: Spacing.md,
  },
  pressed: { opacity: 0.7 },
  box: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.line,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  boxChecked: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  text: { flex: 1 },
});
