import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation/types';
import FormError from '../components/FormError';
import OtpInput from '../components/OtpInput';
import { OTP_LENGTH, OTP_MAX_ATTEMPTS } from '../constants';
import { useOtpCountdown } from '../hooks/useOtpCountdown';
import { useRegistrationVerification } from '../hooks/useRegistration';

/**
 * Xác thực mã OTP để hoàn tất đăng ký.
 *
 * Mã đúng thì backend mới tạo tài khoản và trả token, nên màn này không tự
 * điều hướng: mở được phiên là `RootNavigator` chuyển sang eKYC.
 */
export default function RegisterOtpScreen() {
  const nav = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'RegisterOtp'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'RegisterOtp'>>();
  const { email, maskedEmail, expiresInSeconds } = route.params;

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const { verification, resend } = useRegistrationVerification(email);
  const countdown = useOtpCountdown();

  const busy = verification.submitting || resend.submitting;

  const onSubmit = () => {
    if (code.length !== OTP_LENGTH) {
      setCodeError(`Mã gồm ${OTP_LENGTH} chữ số.`);
      return;
    }
    setCodeError(null);
    void verification.submit(code);
  };

  const onResend = async () => {
    const challenge = await resend.submit();
    if (!challenge) return;

    // Mã cũ hết hiệu lực ngay khi backend cấp mã mới — xoá ô nhập để tránh gửi nhầm
    setCode('');
    setCodeError(null);
    countdown.reset();
  };

  return (
    <Screen light style={styles.screen}>
      <Text style={styles.title} accessibilityRole="header">
        Xác thực email
      </Text>
      <Text style={styles.sub}>Mã {OTP_LENGTH} số đã gửi tới {maskedEmail}</Text>

      <OtpInput
        value={code}
        onChange={v => {
          setCode(v);
          if (codeError) setCodeError(null);
        }}
      />

      <FormError message={codeError ?? verification.error ?? resend.error} />

      <Button
        label="Xác nhận"
        variant="emerald"
        onPress={onSubmit}
        loading={verification.submitting}
        disabled={busy}
      />

      <Text style={styles.hint}>
        {countdown.canResend ? (
          <Text style={styles.link} onPress={() => void onResend()}>
            Gửi lại mã
          </Text>
        ) : (
          `Gửi lại sau ${countdown.label}`
        )}
        {` · sai ${OTP_MAX_ATTEMPTS} lần phải yêu cầu mã mới`}
      </Text>

      <Text style={styles.note}>
        Mã có hiệu lực {Math.round(expiresInSeconds / 60)} phút. Không thấy email? Kiểm tra hộp thư
        rác trước khi yêu cầu mã mới.
      </Text>

      <Text style={styles.hint}>
        <Text style={styles.link} onPress={() => nav.navigate('Login')}>
          Quay lại đăng nhập
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Không dùng `center`: ô OTP tự bật bàn phím khi vào màn, vùng cuộn thu lại
  // và `center` sẽ cắt cụt phần trên lẫn phần dưới mà không cuộn tới được.
  screen: { justifyContent: 'flex-start' },
  title: { ...Text_.display, color: Colors.ink, textAlign: 'center', marginTop: Spacing.page },
  sub: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.md },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
  link: { color: Colors.brand, fontFamily: FontFamily.semibold },
  note: { ...Text_.caption, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.md },
});
