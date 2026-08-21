import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, Field } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation/types';
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
    <Screen light>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Đặt lại mật khẩu
        </Text>
        <Text style={styles.sub}>Chọn mật khẩu mới cho tài khoản {email}.</Text>
      </View>

      <Field
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
        error={errors.newPassword}
        helper={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
        autoComplete="new-password"
        editable={!reset.submitting}
      />
      <Field
        label="Nhập lại mật khẩu mới"
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
        editable={!reset.submitting}
      />

      <FormError message={reset.error} />

      <Button label="Đổi mật khẩu" onPress={() => void onSubmit()} loading={reset.submitting} />

      <Text style={styles.hint}>
        <Text style={styles.link} onPress={() => nav.navigate('Login')}>
          Quay lại đăng nhập
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: Spacing.md, paddingTop: Spacing.page, marginBottom: Spacing.xl },
  title: { ...Text_.display, color: Colors.ink },
  sub: { ...Text_.micro, color: Colors.ink3 },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
  link: { color: Colors.brand, fontFamily: FontFamily.semibold },
});
