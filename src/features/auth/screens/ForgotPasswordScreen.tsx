import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { FORGOT_PASSWORD_BACKGROUND } from '../backgrounds';
import AuthButton from '../components/AuthButton';
import AuthField from '../components/AuthField';
import AuthLayout from '../components/AuthLayout';
import AuthNote from '../components/AuthNote';
import AuthSwitchLink from '../components/AuthSwitchLink';
import FormError from '../components/FormError';
import { OTP_LENGTH } from '../constants';
import { useFieldErrors } from '../hooks/useFieldErrors';
import { useForgotPassword } from '../hooks/usePasswordReset';
import { validateForgotPassword } from '../schemas/authForms';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

/**
 * Quên mật khẩu — bước yêu cầu mã.
 *
 * Backend trả thành công cho mọi email để không lộ email nào đã đăng ký, nên
 * màn này không khẳng định email có tồn tại; câu chữ phải giữ đúng tinh thần đó.
 */
export default function ForgotPasswordScreen() {
  const nav = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const { errors, validateField, clearField, validateSubmit } = useFieldErrors(validateForgotPassword);
  const { submit, submitting, error } = useForgotPassword();

  const onSubmit = async () => {
    if (!validateSubmit({ email })) return;

    const sent = await submit(email);
    if (!sent) return;

    nav.navigate('ResetOtp', { email: email.trim().toLowerCase() });
  };

  return (
    <AuthLayout
      background={FORGOT_PASSWORD_BACKGROUND}
      title="Quên mật khẩu"
      subtitle={`Nhập email đã đăng ký, chúng tôi sẽ gửi mã ${OTP_LENGTH} số để đặt lại mật khẩu.`}
    >
      <AuthField
        label="Email"
        icon="mail"
        value={email}
        onChangeText={v => {
          setEmail(v);
          clearField('email');
        }}
        onBlur={() => validateField({ email }, 'email')}
        placeholder="vidu@email.com"
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        returnKeyType="send"
        onSubmitEditing={() => void onSubmit()}
        required
        error={errors.email}
        editable={!submitting}
      />

      <AuthNote>
        Nếu email có trong hệ thống, mã sẽ được gửi trong vòng vài phút. Vui lòng kiểm tra cả hộp
        thư đến và thư rác (spam).
      </AuthNote>

      <FormError message={error} />

      <AuthButton
        label="Gửi mã xác thực"
        trailingIcon="arrowRight"
        onPress={() => void onSubmit()}
        loading={submitting}
      />

      <AuthSwitchLink
        prompt="Nhớ ra mật khẩu?"
        action="Quay lại đăng nhập"
        onPress={() => nav.goBack()}
      />
    </AuthLayout>
  );
}
