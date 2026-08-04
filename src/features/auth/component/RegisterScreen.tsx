import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, Checkbox, Field } from '@/components/ui';
import { toUserMessage } from '@/lib/api';
import type { AuthStackParamList } from '@/navigation/types';
import { PRIVACY_LABEL, TERMS_LABEL } from '../constant';
import { register } from '../api';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

/** Màn 4 — tạo tài khoản (luồng A1.1). */
export default function RegisterScreen() {
  const nav = useNavigation<Nav>();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Nhập họ tên đúng như trên CCCD.';
    if (!/^0\d{9}$|^\d{2}x{2}\s/.test(phone.replace(/\s/g, '')) && phone.replace(/\D/g, '').length < 10)
      next.phone = 'Số điện thoại gồm 10 chữ số.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Email chưa đúng định dạng.';
    if (password.length < 8) next.password = 'Mật khẩu tối thiểu 8 ký tự.';
    if (!accepted) next.accepted = 'Cần đồng ý điều khoản trước khi tạo tài khoản.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({ fullName, phone, email, password, acceptedTerms: accepted });
      nav.navigate('Otp', { mode: 'register' });
    } catch (e) {
      setErrors({ form: toUserMessage(e) });
    } finally {
      setSubmitting(false);
    }
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
        onChangeText={setFullName}
        required
        error={errors.fullName}
        autoComplete="name"
      />
      <Field
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        required
        error={errors.phone}
        autoComplete="tel"
      />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        required
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secure
        required
        error={errors.password}
        helper="Tối thiểu 8 ký tự"
        autoComplete="new-password"
      />

      <Checkbox checked={accepted} onChange={setAccepted} label="Đồng ý điều khoản sử dụng">
        <Text style={styles.terms}>
          Tôi đồng ý <Text style={styles.link}>{TERMS_LABEL}</Text> và{' '}
          <Text style={styles.link}>{PRIVACY_LABEL}</Text>
        </Text>
      </Checkbox>
      {errors.accepted ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {errors.accepted}
        </Text>
      ) : null}
      {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}

      <Button
        label="Tạo tài khoản → nhận OTP"
        onPress={onSubmit}
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
  error: { ...Text_.micro, color: Colors.red, marginBottom: Spacing.md },
  submit: { marginTop: Spacing.lg },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
