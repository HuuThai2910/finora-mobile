import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button } from '@/components/ui';
import { toUserMessage } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import type { AuthStackParamList } from '@/navigation/types';
import { OTP_LENGTH, OTP_LOCK_MINUTES, OTP_MAX_ATTEMPTS } from '../constant';
import { useOtpCountdown } from '../hook/useOtpCountdown';
import { DEMO_OTP, verifyOtp } from '../api';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Otp'>;

/** Màn 2 — xác thực OTP 6 số. */
export default function OtpScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Otp'>>();
  const { signIn } = useAuth();
  const input = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { label, canResend, reset } = useOtpCountdown();

  const onSubmit = async () => {
    if (code.length !== OTP_LENGTH) {
      setError(`Mã gồm ${OTP_LENGTH} chữ số.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const session = await verifyOtp(code);
      if (route.params.mode === 'register' || session.profile.kycStatus !== 'KYC_VERIFIED') {
        signIn(session);
        nav.navigate('EkycCapture');
      } else {
        signIn(session);
      }
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen light style={styles.screen}>
      <Text style={styles.title} accessibilityRole="header">
        Xác thực OTP
      </Text>
      <Text style={styles.sub}>Mã 6 số đã gửi tới 09xx xxx 842</Text>

      <Pressable
        onPress={() => input.current?.focus()}
        accessibilityRole="button"
        accessibilityLabel="Nhập mã OTP"
        style={styles.boxes}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <View key={i} style={[styles.box, i === code.length && styles.boxActive]}>
            <Text style={styles.digit}>{code[i] ?? ''}</Text>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={input}
        value={code}
        onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, OTP_LENGTH))}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        maxLength={OTP_LENGTH}
        autoFocus
        style={styles.hiddenInput}
        accessibilityLabel="Mã xác thực gồm 6 chữ số"
      />

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button label="Xác nhận" variant="emerald" onPress={onSubmit} loading={submitting} />

      <Text style={styles.hint}>
        {canResend ? (
          <Text style={styles.link} onPress={reset}>
            Gửi lại mã
          </Text>
        ) : (
          `Gửi lại sau ${label}`
        )}
        {` · sai ${OTP_MAX_ATTEMPTS} lần khóa ${OTP_LOCK_MINUTES} phút`}
      </Text>

      <Text style={styles.demo}>Bản demo: mã hợp lệ là {DEMO_OTP}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  title: { ...Text_.display, color: Colors.ink, textAlign: 'center', marginTop: Spacing.page },
  sub: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.md },
  boxes: {
    flexDirection: 'row',
    gap: Spacing.lg,
    justifyContent: 'center',
    marginVertical: Spacing.section,
  },
  box: {
    width: 51,
    height: 66,
    borderWidth: 2,
    borderColor: Colors.brand,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { backgroundColor: Colors.brand50 },
  digit: { fontFamily: FontFamily.extrabold, fontSize: FontSize.display, color: Colors.ink },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  error: { ...Text_.micro, color: Colors.red, textAlign: 'center', marginBottom: Spacing.lg },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
  link: { color: Colors.brand, fontFamily: FontFamily.semibold },
  demo: { ...Text_.caption, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.md },
});
