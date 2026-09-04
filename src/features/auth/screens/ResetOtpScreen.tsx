import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation/types';
import FormError from '../components/FormError';
import OtpInput from '../components/OtpInput';
import { OTP_LENGTH, OTP_MAX_ATTEMPTS } from '../constants';
import { useOtpCountdown } from '../hooks/useOtpCountdown';
import { useResendResetOtp, useVerifyResetOtp } from '../hooks/usePasswordReset';
import { validateResetOtp } from '../schemas/authForms';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ResetOtp'>;

/**
 * Quên mật khẩu — bước nhập mã OTP, tách riêng khỏi bước đặt mật khẩu mới để
 * mỗi màn chỉ một việc và bàn phím số không tranh chỗ với hai ô mật khẩu.
 *
 * Mã được backend kiểm tra ngay tại đây qua `/verify-reset-otp` (không tiêu huỷ
 * mã), nên mã sai bị chặn trước khi người dùng mất công nghĩ mật khẩu mới.
 */
export default function ResetOtpScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ResetOtp'>>();
  const { email } = route.params;

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const verify = useVerifyResetOtp(email);
  const resend = useResendResetOtp(email);
  const countdown = useOtpCountdown();

  const busy = verify.submitting || resend.submitting;

  const onSubmit = async () => {
    const found = validateResetOtp({ otp });
    if (found.otp) {
      setOtpError(found.otp);
      return;
    }
    setOtpError(null);

    const valid = await verify.submit(otp);
    if (!valid) return;

    nav.navigate('ResetPassword', { email, otp });
  };

  const onResend = async () => {
    const sent = await resend.submit();
    if (!sent) return;

    // Mã cũ hết hiệu lực khi backend cấp mã mới — xoá ô nhập để tránh gửi nhầm
    setOtp('');
    setOtpError(null);
    verify.clearError();
    countdown.reset();
  };

  return (
    <Screen light style={styles.screen}>
      <Text style={styles.title} accessibilityRole="header">
        Nhập mã xác thực
      </Text>
      <Text style={styles.sub}>Mã {OTP_LENGTH} số đã gửi tới {email}</Text>

      <OtpInput
        value={otp}
        onChange={v => {
          setOtp(v);
          if (otpError) setOtpError(null);
          if (verify.error) verify.clearError();
        }}
      />

      <FormError message={otpError ?? verify.error ?? resend.error} />

      <Button
        label="Tiếp tục"
        onPress={() => void onSubmit()}
        loading={verify.submitting}
        disabled={busy}
      />

      <Text style={styles.hint}>
        {countdown.canResend ? (
          <Text style={styles.link} onPress={() => void onResend()}>
            Gửi lại mã
          </Text>
        ) : (
          `Gửi lại sau ${countdown.label}`
        )}
        {` · sai ${OTP_MAX_ATTEMPTS} lần phải yêu cầu mã mới`}
      </Text>

      <Text style={styles.hint}>
        <Text style={styles.link} onPress={() => nav.navigate('Login')}>
          Quay lại đăng nhập
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Không dùng `center`: ô OTP tự bật bàn phím khi vào màn, vùng cuộn thu lại
  // và `center` sẽ cắt cụt phần trên lẫn phần dưới mà không cuộn tới được.
  screen: { justifyContent: 'flex-start' },
  title: { ...Text_.display, color: Colors.ink, textAlign: 'center', marginTop: Spacing.page },
  sub: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.md },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
  link: { color: Colors.brand, fontFamily: FontFamily.semibold },
});
