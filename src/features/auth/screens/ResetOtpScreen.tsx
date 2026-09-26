import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { OTP_BACKGROUND } from '../backgrounds';
import AuthButton from '../components/AuthButton';
import AuthLayout from '../components/AuthLayout';
import AuthSwitchLink from '../components/AuthSwitchLink';
import FormError from '../components/FormError';
import OtpInput from '../components/OtpInput';
import OtpResend from '../components/OtpResend';
import { OTP_LENGTH } from '../constants';
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
    <AuthLayout
      background={OTP_BACKGROUND}
      title="Nhập mã xác thực"
      subtitle={`Mã ${OTP_LENGTH} số đã gửi tới ${email}`}
    >
      <OtpInput
        value={otp}
        onChange={v => {
          setOtp(v);
          if (otpError) setOtpError(null);
          if (verify.error) verify.clearError();
        }}
      />

      <FormError message={otpError ?? verify.error ?? resend.error} />

      <AuthButton
        label="Tiếp tục"
        trailingIcon="arrowRight"
        onPress={() => void onSubmit()}
        loading={verify.submitting}
        disabled={busy}
      />

      <OtpResend
        canResend={countdown.canResend}
        countdownLabel={countdown.label}
        onResend={() => void onResend()}
        disabled={busy}
      />

      <AuthSwitchLink action="Quay lại đăng nhập" onPress={() => nav.navigate('Login')} />
    </AuthLayout>
  );
}
