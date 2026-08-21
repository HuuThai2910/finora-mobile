import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, Field, InfoNote } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation/types';
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
    <Screen light>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Quên mật khẩu
        </Text>
        <Text style={styles.sub}>
          Nhập email đã đăng ký, chúng tôi sẽ gửi mã {OTP_LENGTH} số để đặt lại mật khẩu.
        </Text>
      </View>

      <Field
        label="Email"
        value={email}
        onChangeText={v => {
          setEmail(v);
          clearField('email');
        }}
        onBlur={() => validateField({ email }, 'email')}
        placeholder="vidu@email.com"
        keyboardType="email-address"
        required
        error={errors.email}
        autoComplete="email"
        autoCapitalize="none"
        editable={!submitting}
      />

      <InfoNote tone="info">
        Nếu email có trong hệ thống, mã sẽ được gửi trong vòng vài phút. Mỗi email chỉ được yêu cầu
        tối đa 3 lần mỗi giờ.
      </InfoNote>

      <FormError message={error} />

      <Button
        label="Gửi mã xác thực"
        onPress={() => void onSubmit()}
        loading={submitting}
        style={styles.submit}
      />

      <Text style={styles.hint}>
        Nhớ ra mật khẩu?{' '}
        <Text style={styles.link} onPress={() => nav.goBack()}>
          Quay lại đăng nhập
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: Spacing.md, marginBottom: Spacing.xxl, paddingTop: Spacing.page },
  title: { ...Text_.display, color: Colors.ink },
  sub: { ...Text_.micro, color: Colors.ink3 },
  submit: { marginTop: Spacing.lg },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
  link: { color: Colors.brand, fontFamily: Text_.microBold.fontFamily },
});
