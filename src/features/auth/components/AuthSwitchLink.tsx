import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing, Text_ } from '@/theme';

type Props = {
  /** Câu dẫn, ví dụ "Đã có tài khoản?"; bỏ trống thì chỉ hiện chữ hành động. */
  prompt?: string;
  /** Hành động, ví dụ "Đăng nhập". */
  action: string;
  onPress: () => void;
};

/**
 * Dòng chuyển qua lại giữa các màn tài khoản ở cuối form. Cả dòng là vùng bấm
 * cao 44pt: riêng chữ link thì quá thấp để chạm trúng trên điện thoại.
 */
export default function AuthSwitchLink({ prompt, action, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={action}
      hitSlop={Spacing.sm}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.prompt}>
        {prompt ? `${prompt} ` : null}
        <Text style={styles.action}>{action}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'center',
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  pressed: { opacity: 0.6 },
  prompt: { ...Text_.micro, color: Colors.ink3, textAlign: 'center' },
  action: { fontFamily: FontFamily.bold, color: Colors.authPrimary },
});
