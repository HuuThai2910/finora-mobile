import { useRef, useState } from 'react';
import { StyleSheet, Text, type TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';
import AuthButton from '../components/AuthButton';
import AuthCheckbox from '../components/AuthCheckbox';
import AuthField from '../components/AuthField';
import AuthLayout from '../components/AuthLayout';
import AuthSwitchLink from '../components/AuthSwitchLink';
import FormError from '../components/FormError';
import { PASSWORD_MIN_LENGTH, PRIVACY_LABEL, TERMS_LABEL } from '../constants';
import { useFieldErrors } from '../hooks/useFieldErrors';
import { useRegistration } from '../hooks/useRegistration';
import { validateRegister } from '../schemas/authForms';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

/** Nguyên câu đồng ý để trình đọc màn hình đọc đúng điều người dùng xác nhận. */
const CONSENT_LABEL = `Tôi đồng ý với ${TERMS_LABEL} và ${PRIVACY_LABEL}`;

/** Giữ tên tài liệu trên cùng một dòng, tránh ngắt kiểu "Chính | sách bảo vệ…". */
const keepTogether = (name: string) => name.replace(/ /g, ' ');

/**
 * Tạo tài khoản — bước khai thông tin.
 *
 * Không hỏi họ tên: tên thật được lấy từ OCR CCCD khi quét eKYC sau đăng nhập,
 * tránh cảnh người dùng gõ tên lệch với giấy tờ.
 *
 * Tài khoản chưa tồn tại sau màn này: backend chỉ gửi mã OTP về email và giữ
 * thông tin khoảng 5 phút. Việc tạo tài khoản diễn ra ở màn nhập mã.
 */
export default function RegisterScreen() {
  const nav = useNavigation<Nav>();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const { errors, validateField, clearField, validateSubmit } = useFieldErrors(validateRegister);
  const { submit, submitting, error } = useRegistration();

  const values = { email, phone, password, confirmPassword, acceptedTerms };

  const onSubmit = async () => {
    if (!validateSubmit(values)) return;

    // `confirmPassword` chỉ để người dùng tự soát; backend chỉ nhận một mật khẩu.
    const challenge = await submit({ email, phone, password });
    if (!challenge) return;

    nav.navigate('RegisterOtp', {
      email: challenge.email,
      maskedEmail: challenge.maskedEmail,
      expiresInSeconds: challenge.otpExpiresInSeconds,
    });
  };

  return (
    <AuthLayout title="Tạo tài khoản" subtitle="Miễn phí · chỉ mất 3 phút">
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
        onSubmitEditing={() => phoneRef.current?.focus()}
        required
        error={errors.email}
        editable={!submitting}
      />
      <AuthField
        label="Số điện thoại"
        icon="phone"
        inputRef={phoneRef}
        value={phone}
        onChangeText={v => {
          setPhone(v);
          clearField('phone');
        }}
        onBlur={() => validateField(values, 'phone')}
        placeholder="0912 345 678"
        keyboardType="phone-pad"
        autoComplete="tel"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        required
        error={errors.phone}
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
        placeholder="Nhập mật khẩu"
        secure
        autoComplete="new-password"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        required
        helper={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
        error={errors.password}
        editable={!submitting}
      />
      <AuthField
        label="Nhập lại mật khẩu"
        icon="lock"
        inputRef={confirmRef}
        value={confirmPassword}
        onChangeText={v => {
          setConfirmPassword(v);
          clearField('confirmPassword');
        }}
        onBlur={() => validateField(values, 'confirmPassword')}
        placeholder="Nhập lại mật khẩu ở trên"
        secure
        autoComplete="new-password"
        returnKeyType="done"
        required
        error={errors.confirmPassword}
        editable={!submitting}
      />

      <AuthCheckbox
        checked={acceptedTerms}
        onChange={v => {
          setAcceptedTerms(v);
          clearField('acceptedTerms');
        }}
        label={CONSENT_LABEL}
        error={errors.acceptedTerms}
      >
        {/* Tên tài liệu chỉ in đậm, không tô màu link: chưa có trang tài liệu để
            mở, chữ trông bấm được mà bấm không ra gì thì còn tệ hơn. */}
        <Text style={styles.consent}>
          Tôi đồng ý với <Text style={styles.consentDoc}>{keepTogether(TERMS_LABEL)}</Text> và{' '}
          <Text style={styles.consentDoc}>{keepTogether(PRIVACY_LABEL)}</Text>.
        </Text>
      </AuthCheckbox>

      <FormError message={error} />

      <AuthButton
        label="Tạo tài khoản → nhận mã"
        onPress={() => void onSubmit()}
        loading={submitting}
      />

      <AuthSwitchLink prompt="Đã có tài khoản?" action="Đăng nhập" onPress={() => nav.goBack()} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  consent: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 22, color: Colors.authLabel },
  consentDoc: { fontFamily: FontFamily.semibold },
});
