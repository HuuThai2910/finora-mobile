import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, Field } from '@/components/ui';
import { toUserMessage } from '@/lib/api';
import type { AuthStackParamList } from '@/navigation/types';
import BrandMark from './BrandMark';
import { login } from '../api';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

/** Màn 1 — đăng nhập (luồng A1.1). */
export default function LoginScreen() {
  const nav = useNavigation<Nav>();
  const [phone, setPhone] = useState('09xx xxx 842');
  const [password, setPassword] = useState('demo1234');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await login({ phone, password });
      nav.navigate('Otp', { mode: 'login' });
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen light style={styles.screen}>
      <View style={styles.head}>
        <BrandMark />
      </View>

      <Field
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <Field
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secure
        autoComplete="current-password"
      />

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button label="Đăng nhập" onPress={onSubmit} loading={submitting} style={styles.primary} />

      <Button
        label="SSO Keycloak · OpenID Connect"
        variant="outline"
        icon="shield"
        onPress={onSubmit}
      />

      <Text style={styles.hint}>Face ID / vân tay từ lần đăng nhập sau</Text>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          Chưa có tài khoản?{' '}
          <Text style={styles.link} onPress={() => nav.navigate('Register')}>
            Tạo tài khoản
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  head: { paddingTop: Spacing.page, marginBottom: Spacing.section },
  primary: { marginTop: Spacing.md, marginBottom: Spacing.lg },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
  link: { color: Colors.brand, fontFamily: Text_.microBold.fontFamily },
  error: { ...Text_.micro, color: Colors.red, marginBottom: Spacing.lg },
  footer: { marginTop: 'auto', paddingTop: Spacing.xl },
});
