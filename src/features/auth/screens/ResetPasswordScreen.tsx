import { useRef, useState } from 'react';
import { Alert, type TextInput } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { RESET_PASSWORD_BACKGROUND } from '../backgrounds';
import AuthButton from '../components/AuthButton';
import AuthField from '../components/AuthField';
import AuthLayout from '../components/AuthLayout';
import AuthSwitchLink from '../components/AuthSwitchLink';
import FormError from '../components/FormError';
import { PASSWORD_MIN_LENGTH } from '../constants';
import { useFieldErrors } from '../hooks/useFieldErrors';
import { useResetPassword } from '../hooks/usePasswordReset';
import { validateResetPassword } from '../schemas/authForms';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

/**
 * Quên mật khẩu — bước đặt mật khẩu mới. Mã OTP đã nhập ở màn trước và đi kèm
 * qua params; backend chỉ xác thực mã tại đây nên mã sai/hết hạn sẽ báo lỗi ở
 * màn này. Người dùng vẫn lùi được về màn nhập mã bằng nút back của hệ thống.
 *
 * Đổi mật khẩu xong không tự đăng nhập: Keycloak chỉ nhận mật khẩu mới ở lần
 * đăng nhập kế tiếp, và bắt nhập lại giúp người dùng xác nhận mình nhớ đúng mã.
 */
export default function ResetPasswordScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();
  const { email, otp } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const confirmRef = useRef<TextInput>(null);
  const { errors, validateField, clearField, validateSubmit } = useFieldErrors(validateResetPassword);
  const reset = useResetPassword(email);

  const values = { newPassword, confirmPassword };

  const onSubmit = async () => {
    if (!validateSubmit(values)) return;

    const done = await reset.submit({ otp, newPassword });
    if (!done) return;

    Alert.alert('Đã đổi mật khẩu', 'Đăng nhập lại bằng mật khẩu mới.', [
      { text: 'Đăng nhập', onPress: () => nav.navigate('Login') },
    ]);
  };

  return (
    <AuthLayout
      background={RESET_PASSWORD_BACKGROUND}
      title="Đặt lại mật khẩu"
      subtitle={`Chọn mật khẩu mới cho tài khoản ${email}.`}
    >
      {/* Mockup không vẽ icon đầu ô: hai ô cùng là mật khẩu, nhãn đã phân biệt được. */}
      <AuthField
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={v => {
          setNewPassword(v);
          clearField('newPassword');
        }}
        onBlur={() => validateField(values, 'newPassword')}
        placeholder="Nhập mật khẩu mới"
        secure
        required
        helper={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
        error={errors.newPassword}
        autoComplete="new-password"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        editable={!reset.submitting}
      />
      <AuthField
        label="Nhập lại mật khẩu mới"
        inputRef={confirmRef}
        value={confirmPassword}
        onChangeText={v => {
          setConfirmPassword(v);
          clearField('confirmPassword');
        }}
        onBlur={() => validateField(values, 'confirmPassword')}
        placeholder="Nhập lại mật khẩu ở trên"
        secure
        required
        error={errors.confirmPassword}
        autoComplete="new-password"
        returnKeyType="go"
        onSubmitEditing={() => void onSubmit()}
        editable={!reset.submitting}
      />

      <FormError message={reset.error} />

      <AuthButton
        label="Đổi mật khẩu"
        trailingIcon="arrowRight"
        onPress={() => void onSubmit()}
        loading={reset.submitting}
      />

      <AuthSwitchLink action="Quay lại đăng nhập" onPress={() => nav.navigate('Login')} />
    </AuthLayout>
  );
}
