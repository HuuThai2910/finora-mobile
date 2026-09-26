import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  /** Nhãn đọc cho trình đọc màn hình; phần chữ nhìn thấy nằm ở `children`. */
  label: string;
  error?: string;
  children: React.ReactNode;
};

const SIZE = 22;

/**
 * Ô đồng ý dạng tròn theo mockup đăng ký. Khác `Checkbox` dùng chung (ô vuông)
 * vì nhóm màn tài khoản đang theo bộ nhận diện mới. Vùng chạm phủ cả ô lẫn chữ.
 *
 * Câu đồng ý thường dài hai dòng nên ô tròn canh theo dòng đầu, không canh giữa
 * cả khối; chữ bên trong nên có `lineHeight` bằng `SIZE` để ô và dòng đầu thẳng hàng.
 */
export default function AuthCheckbox({ checked, onChange, label, error, children }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View
          style={[
            styles.circle,
            checked && styles.circleChecked,
            !!error && !checked && styles.circleError,
          ]}
        >
          {checked ? <Icon name="check" size={14} color={Colors.onDark} strokeWidth={3} /> : null}
        </View>
        <View style={styles.text}>{children}</View>
      </Pressable>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    minHeight: MIN_TOUCH,
    // Một dòng thì ô tròn nằm giữa vùng chạm 44pt; nhiều dòng thì vùng chạm cao theo chữ.
    paddingVertical: (MIN_TOUCH - SIZE) / 2,
  },
  pressed: { opacity: 0.7 },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
    borderColor: Colors.authControl,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleChecked: { backgroundColor: Colors.authPrimary, borderColor: Colors.authPrimary },
  circleError: { borderColor: Colors.red },
  text: { flex: 1 },
  error: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.red,
    marginTop: Spacing.xs,
  },
});
