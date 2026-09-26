import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
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
import { useRegistrationVerification } from '../hooks/useRegistration';

/**
 * Xác thực mã OTP để hoàn tất đăng ký. Cùng bố cục với màn nhập mã đặt lại mật
 * khẩu (mockup OTP), chỉ khác câu chữ.
 *
 * Mã đúng thì backend mới tạo tài khoản và trả token, nên màn này không tự
 * điều hướng: mở được phiên là `RootNavigator` chuyển sang app chính.
 */
export default function RegisterOtpScreen() {
  const nav = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'RegisterOtp'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'RegisterOtp'>>();
  const { email, maskedEmail, expiresInSeconds } = route.params;

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const { verification, resend } = useRegistrationVerification(email);
  const countdown = useOtpCountdown();

  const busy = verification.submitting || resend.submitting;

  const onSubmit = () => {
    if (code.length !== OTP_LENGTH) {
      setCodeError(`Mã gồm ${OTP_LENGTH} chữ số.`);
      return;
    }
    setCodeError(null);
    void verification.submit(code);
  };

  const onResend = async () => {
    const challenge = await resend.submit();
    if (!challenge) return;

    // Mã cũ hết hiệu lực ngay khi backend cấp mã mới — xoá ô nhập để tránh gửi nhầm
    setCode('');
    setCodeError(null);
    countdown.reset();
  };

  return (
    <AuthLayout
      background={OTP_BACKGROUND}
      title="Xác thực email"
      subtitle={`Mã ${OTP_LENGTH} số đã gửi tới ${maskedEmail}`}
    >
      <OtpInput
        value={code}
        onChange={v => {
          setCode(v);
          if (codeError) setCodeError(null);
        }}
      />

      <FormError message={codeError ?? verification.error ?? resend.error} />

      <AuthButton
        label="Xác nhận"
        trailingIcon="arrowRight"
        onPress={onSubmit}
        loading={verification.submitting}
        disabled={busy}
      />

      <OtpResend
        canResend={countdown.canResend}
        countdownLabel={countdown.label}
        onResend={() => void onResend()}
        disabled={busy}
      />

      <Text style={styles.note}>
        Mã có hiệu lực {Math.round(expiresInSeconds / 60)} phút. Không thấy email? Kiểm tra hộp thư
        rác trước khi yêu cầu mã mới.
      </Text>

      <AuthSwitchLink action="Quay lại đăng nhập" onPress={() => nav.navigate('Login')} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  note: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.ink3,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
