import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing, Text_ } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';
import AuthButton from '../components/AuthButton';
import AuthField from '../components/AuthField';
import AuthLayout from '../components/AuthLayout';
import AuthSwitchLink from '../components/AuthSwitchLink';
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
 * thành công. Đăng nhập xong, `RootNavigator` tự chuyển sang app chính nên màn
 * này không tự điều hướng.
 */
export default function LoginScreen() {
  const nav = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoOpen, setDemoOpen] = useState(false);
  const passwordRef = useRef<TextInput>(null);
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
    <AuthLayout>
      <AuthField
        label="Email"
        icon="mail"
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
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={errors.email}
        editable={!submitting}
      />
      <AuthField
        label="Mật khẩu"
        icon="lock"
        inputRef={passwordRef}
        value={password}
        onChangeText={v => {
          setPassword(v);
          clearField('password');
        }}
        onBlur={() => validateField(values, 'password')}
        placeholder="Nhập mật khẩu của bạn"
        secure
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        error={errors.password}
        editable={!submitting}
        style={styles.passwordField}
      />

      <Pressable
        onPress={() => nav.navigate('ForgotPassword')}
        accessibilityRole="link"
        hitSlop={Spacing.sm}
        style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}
      >
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </Pressable>

      <FormError message={error} />

      <AuthButton
        label="Đăng nhập"
        trailingIcon="arrowRight"
        onPress={onSubmit}
        loading={submitting}
      />

      <AuthSwitchLink
        prompt="Chưa có tài khoản?"
        action="Tạo tài khoản"
        onPress={() => nav.navigate('Register')}
      />

      {__DEV__ && (
        <View style={styles.demo}>
          {/* Thu gọn mặc định để bản dev vẫn giữ đúng bố cục mockup. */}
          <Pressable
            onPress={() => setDemoOpen(v => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: demoOpen }}
            style={({ pressed }) => [styles.demoToggle, pressed && styles.pressed]}
          >
            <Text style={styles.demoToggleText}>
              {demoOpen ? 'Ẩn tài khoản thử nghiệm' : 'Dùng tài khoản thử nghiệm'}
            </Text>
          </Pressable>

          {demoOpen
            ? DEMO_ACCOUNTS.map(acc => (
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
              ))
            : null}
        </View>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  // Mockup để dòng "Quên mật khẩu?" sát ô mật khẩu hơn khoảng cách giữa hai ô.
  passwordField: { marginBottom: Spacing.md },
  forgot: {
    alignSelf: 'flex-end',
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
  },
  forgotText: { fontFamily: FontFamily.medium, fontSize: 14, color: Colors.authPrimary },
  pressed: { opacity: 0.6 },
  demo: { marginTop: Spacing.sm, gap: Spacing.md },
  demoToggle: { alignSelf: 'center', minHeight: MIN_TOUCH, justifyContent: 'center' },
  demoToggleText: { ...Text_.caption, color: Colors.ink3, textDecorationLine: 'underline' },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    borderRadius: 12,
  },
  demoChipPressed: { backgroundColor: Colors.brand50, borderColor: Colors.brand100 },
  demoEmail: { ...Text_.micro, color: Colors.ink, flexShrink: 1 },
  demoBadge: { ...Text_.microBold, color: Colors.authPrimary, marginLeft: Spacing.md },
});
