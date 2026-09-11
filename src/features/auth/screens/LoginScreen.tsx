import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { MIN_TOUCH, Radius, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, Field } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation/types';
import BrandMark from '../components/BrandMark';
import FormError from '../components/FormError';
import { useFieldErrors } from '../hooks/useFieldErrors';
import { useLogin } from '../hooks/useLogin';
import { validateLogin } from '../schemas/authForms';

/**
 * Tài khoản mẫu đã seed sẵn trong Keycloak (môi trường phát triển).
 *
 * App này dành cho người vay và nhà đầu tư, nên không đưa tài khoản ADMIN vào —
 * đăng nhập ADMIN ở đây cũng không mở thêm được màn nào.
 *
 * Khu này chỉ hiển thị khi `__DEV__`, nên mật khẩu không đi vào bản phát hành.
 */
const DEMO_ACCOUNTS = [
  { email: 'nguyenhuynhngochai147@gmail.com', password: 'Xen123123!', label: 'Tài khoản của tôi' },
  { email: 'le.thu.thao@gmail.com', password: 'Finora@12345', label: 'Người vay' },
  { email: 'investor@finora.vn', password: 'Finora@12345', label: 'Nhà đầu tư' },
] as const;

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

/**
 * Đăng nhập bằng email và mật khẩu.
 *
 * Không có bước OTP: `finora-user` cấp token ngay khi Keycloak xác thực mật khẩu
 * thành công. Đăng nhập xong, `RootNavigator` tự chuyển sang eKYC hoặc app chính
 * tuỳ trạng thái hồ sơ, nên màn này không tự điều hướng.
 */
export default function LoginScreen() {
  const nav = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { errors, validateField, clearField, validateSubmit } = useFieldErrors(validateLogin);
  const { submit, submitting, error } = useLogin();

  const values = { email, password };

  const onSubmit = () => {
    if (!validateSubmit(values)) return;

    void submit({ email, password });
  };

  // Điền sẵn tài khoản mẫu — người dùng vẫn bấm "Đăng nhập" để gửi.
  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    clearField('email');
    clearField('password');
  };

  return (
    <Screen light style={styles.screen}>
      <View style={styles.head}>
        <BrandMark />
      </View>

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
        autoComplete="email"
        autoCapitalize="none"
        error={errors.email}
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
        placeholder="Nhập mật khẩu của bạn"
        secure
        autoComplete="current-password"
        error={errors.password}
        editable={!submitting}
      />

      <Text style={styles.forgot} onPress={() => nav.navigate('ForgotPassword')}>
        Quên mật khẩu?
      </Text>

      <FormError message={error} />

      <Button label="Đăng nhập" onPress={onSubmit} loading={submitting} style={styles.primary} />

      {__DEV__ && (
      <View style={styles.demo}>
        <Text style={styles.demoTitle}>Tài khoản thử nghiệm nhanh</Text>
        {DEMO_ACCOUNTS.map(acc => (
          <Pressable
            key={acc.email}
            onPress={() => fillDemo(acc.email, acc.password)}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={`Điền tài khoản ${acc.label}`}
            style={({ pressed }) => [styles.demoChip, pressed && styles.demoChipPressed]}
          >
            <Text style={styles.demoEmail} numberOfLines={1}>
              {acc.email}
            </Text>
            <Text style={styles.demoBadge}>{acc.label}</Text>
          </Pressable>
        ))}
      </View>
      )}

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
  // `center` chỉ được phép khi nội dung còn thấp hơn vùng cuộn. Bàn phím mở làm
  // vùng cuộn thấp đi, lúc đó `center` cắt cụt cả hai đầu và phần bị cắt không
  // cuộn tới được. `flex-start` giữ nội dung neo trên, vẫn cuộn bình thường.
  screen: { justifyContent: 'flex-start' },
  head: { paddingTop: Spacing.page, marginBottom: Spacing.section },
  forgot: {
    ...Text_.micro,
    color: Colors.brand,
    textAlign: 'right',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  primary: { marginTop: Spacing.md },
  demo: { marginTop: Spacing.xxl },
  demoTitle: {
    ...Text_.micro,
    color: Colors.ink3,
    marginBottom: Spacing.md,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.sm,
  },
  demoChipPressed: { backgroundColor: Colors.brand50, borderColor: Colors.brand100 },
  demoEmail: { ...Text_.micro, color: Colors.ink, flexShrink: 1 },
  demoBadge: {
    ...Text_.microBold,
    color: Colors.brand,
    marginLeft: Spacing.md,
  },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
  link: { color: Colors.brand, fontFamily: Text_.microBold.fontFamily },
  footer: { marginTop: 'auto', paddingTop: Spacing.xl },
});
