import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing, tabularNums } from '@/theme';
import { OTP_MAX_ATTEMPTS } from '../constants';

type Props = {
  canResend: boolean;
  /** Thời gian còn phải chờ, dạng mm:ss. */
  countdownLabel: string;
  onResend: () => void;
  disabled?: boolean;
};

/**
 * Dòng gửi lại mã dưới nút xác nhận, dùng chung cho hai màn nhập OTP. Hết giờ
 * chờ thì "Gửi lại mã" thành nút riêng có vùng bấm 44pt, không phải chữ link nhỏ.
 */
export default function OtpResend({ canResend, countdownLabel, onResend, disabled = false }: Props) {
  return (
    <View style={styles.row}>
      {canResend ? (
        <Pressable
          onPress={onResend}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          hitSlop={Spacing.md}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.link}>Gửi lại mã</Text>
        </Pressable>
      ) : (
        <Text style={[styles.text, tabularNums]}>Gửi lại sau {countdownLabel}</Text>
      )}
      <Text style={styles.text}> · sai {OTP_MAX_ATTEMPTS} lần phải yêu cầu mã mới</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH,
    marginTop: Spacing.md,
  },
  action: { minHeight: MIN_TOUCH, justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  text: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.ink3 },
  link: { fontFamily: FontFamily.bold, fontSize: 13, lineHeight: 19, color: Colors.authPrimary },
});
