import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, Checkbox, Field } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation/types';
import FormError from '../components/FormError';
import { PASSWORD_MIN_LENGTH, PRIVACY_LABEL, TERMS_LABEL } from '../constants';
import { useFieldErrors } from '../hooks/useFieldErrors';
import { useRegistration } from '../hooks/useRegistration';
import { validateRegister } from '../schemas/authForms';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

/**
 * Tạo tài khoản — bước khai thông tin.
 *
 * Tài khoản chưa tồn tại sau màn này: backend chỉ gửi mã OTP về email và giữ
 * thông tin khoảng 5 phút. Việc tạo tài khoản diễn ra ở màn nhập mã.
 */
export default function RegisterScreen() {
  const nav = useNavigation<Nav>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { errors, validateField, clearField, validateSubmit } = useFieldErrors(validateRegister);
  const { submit, submitting, error } = useRegistration();

  const values = { fullName, email, phone, password, confirmPassword, acceptedTerms };

  const onSubmit = async () => {
    if (!validateSubmit(values)) return;

    // `confirmPassword` chỉ để người dùng tự soát; backend chỉ nhận một mật khẩu.
    const challenge = await submit({ fullName, email, phone, password });
    if (!challenge) return;

    nav.navigate('RegisterOtp', {
      email: challenge.email,
      maskedEmail: challenge.maskedEmail,
      expiresInSeconds: challenge.otpExpiresInSeconds,
    });
  };

  return (
    <Screen light>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Tạo tài khoản
        </Text>
        <Text style={styles.sub}>Miễn phí · chỉ mất 3 phút</Text>
      </View>

      <Field
        label="Họ và tên (theo CCCD)"
        value={fullName}
        onChangeText={v => {
          setFullName(v);
          clearField('fullName');
        }}
        onBlur={() => validateField(values, 'fullName')}
        placeholder="Nguyễn Văn A"
        required
        error={errors.fullName}
        autoComplete="name"
        editable={!submitting}
      />
      <Field
        label="Email"
        value={email}
        onChangeText={v => {
          setEmail(v);
          clearField('email');
        }}
        onBlur={() => validateField(values, 'email')}
        placeholder="vidu@email.com"
        keyboardType="email-address"
        required
        error={errors.email}
        helper="Mã xác thực sẽ được gửi tới email này"
        autoComplete="email"
        autoCapitalize="none"
        editable={!submitting}
      />
      <Field
        label="Số điện thoại"
        value={phone}
        onChangeText={v => {
          setPhone(v);
          clearField('phone');
        }}
        onBlur={() => validateField(values, 'phone')}
        placeholder="0912 345 678"
        keyboardType="phone-pad"
        required
        error={errors.phone}
        autoComplete="tel"
        editable={!submitting}
      />
      <Field
        label="Mật khẩu"
        value={password}
        onChangeText={v => {
          setPassword(v);
          clearField('password');
        }}
        onBlur={() => validateField(values, 'password')}
        placeholder="Nhập mật khẩu"
        secure
        required
        error={errors.password}
        helper={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
        autoComplete="new-password"
        editable={!submitting}
      />
      <Field
        label="Nhập lại mật khẩu"
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
        editable={!submitting}
      />

      <Checkbox
        checked={acceptedTerms}
        onChange={v => {
          setAcceptedTerms(v);
          clearField('acceptedTerms');
        }}
        label="Đồng ý điều khoản sử dụng"
      >
        <Text style={styles.terms}>
          Tôi đồng ý <Text style={styles.link}>{TERMS_LABEL}</Text> và{' '}
          <Text style={styles.link}>{PRIVACY_LABEL}</Text>
        </Text>
      </Checkbox>
      {errors.acceptedTerms ? (
        <Text style={styles.fieldError} accessibilityLiveRegion="polite">
          {errors.acceptedTerms}
        </Text>
      ) : null}

      <FormError message={error} />

      <Button
        label="Tạo tài khoản → nhận mã"
        onPress={() => void onSubmit()}
        loading={submitting}
        style={styles.submit}
      />

      <Text style={styles.hint}>
        Đã có tài khoản?{' '}
        <Text style={styles.link} onPress={() => nav.goBack()}>
          Đăng nhập
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xxl, paddingTop: Spacing.xl },
  title: { ...Text_.display, color: Colors.ink },
  sub: { ...Text_.micro, color: Colors.ink3 },
  terms: { ...Text_.micro, color: Colors.ink2 },
  link: { color: Colors.brand, fontFamily: FontFamily.bold },
  fieldError: { ...Text_.micro, color: Colors.red, marginBottom: Spacing.md },
  submit: { marginTop: Spacing.lg },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
