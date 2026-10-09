import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, MIN_TOUCH, Radius, SoftShadow, Spacing, lh } from '@/theme';
import { canType } from '../hooks/pinFlowMachine';
import { usePinFlow } from '../hooks/usePinFlow';
import { pinStepCopy } from '../mappers/pinCopy';
import type { PinOutcome, PinRequest } from '../types';
import PinDots from './PinDots';
import PinKeypad from './PinKeypad';
import PinPasswordForm from './PinPasswordForm';

type Props = {
  request: PinRequest;
  onFinish: (outcome: PinOutcome) => void;
};

/** Trên web/máy tính bảng, bảng giữ bề rộng điện thoại thay vì giãn hết cửa sổ. */
const SHEET_MAX_WIDTH = 480;

/**
 * Bảng nhập mã PIN trượt từ đáy kiểu MoMo: tiêu đề, dòng phụ nêu thao tác đang xác nhận,
 * sáu chấm và bàn phím số tự vẽ. Đóng bằng nút X, chạm lớp phủ hoặc phím Back — trừ khi
 * đang chờ máy chủ.
 */
export default function PinSheet({ request, onFinish }: Props) {
  const insets = useSafeAreaInsets();
  const flow = usePinFlow(request, onFinish);
  const { state } = flow;
  const copy = pinStepCopy(state.step, request);
  const lockable = state.step.name === 'verify' || state.step.name === 'changeCurrent';
  const lockMessage = lockable ? state.lockMessage : null;

  const renderBody = () => {
    switch (state.step.name) {
      case 'loading':
        return <ActivityIndicator style={styles.loading} color={Colors.authPrimary} />;
      case 'loadFailed':
        return (
          <View style={styles.failed}>
            <Text style={styles.error} accessibilityRole="alert">
              {state.message}
            </Text>
            <Button label="Thử lại" variant="outline" onPress={flow.retryLoad} />
          </View>
        );
      case 'resetPassword':
        return <PinPasswordForm error={state.message} onSubmit={flow.submitPassword} />;
      default:
        return (
          <>
            <PinDots filled={state.entry.length} shakeCount={state.shakeCount} />
            <View style={styles.status}>
              {state.busy ? (
                <ActivityIndicator color={Colors.authPrimary} accessibilityLabel="Đang xác nhận" />
              ) : lockMessage || state.message ? (
                <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="assertive">
                  {lockMessage ?? state.message}
                </Text>
              ) : null}
            </View>
            {lockable ? (
              <Pressable
                onPress={flow.forgot}
                disabled={state.busy}
                hitSlop={Spacing.md}
                accessibilityRole="button"
                accessibilityLabel="Quên mã PIN? Đặt lại bằng mật khẩu đăng nhập"
                style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}
              >
                <Text style={styles.forgotText}>Quên mã PIN?</Text>
              </Pressable>
            ) : null}
            <PinKeypad
              onDigit={flow.pressDigit}
              onBackspace={flow.backspace}
              disabled={!canType(state)}
              canErase={!state.busy && state.entry.length > 0}
            />
          </>
        );
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={flow.cancel} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable
          style={styles.scrim}
          onPress={flow.cancel}
          accessibilityRole="button"
          accessibilityLabel="Huỷ nhập mã PIN"
        />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.xl }]}
        >
          <View style={styles.handle} />
          <View style={styles.head}>
            {flow.canGoBack ? (
              <HeadButton icon="chevronLeft" label="Quay lại bước trước" onPress={flow.back} />
            ) : (
              <View style={styles.headSpacer} />
            )}
            <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
              {copy.title}
            </Text>
            <HeadButton icon="x" label="Đóng" onPress={flow.cancel} disabled={state.busy} />
          </View>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.4}>
            {copy.subtitle}
          </Text>
          {renderBody()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type HeadButtonProps = {
  icon: 'chevronLeft' | 'x';
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function HeadButton({ icon, label, onPress, disabled = false }: HeadButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.headButton, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Icon name={icon} size={IconSize.sm} color={Colors.authMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: Colors.applyFormScrim },
  sheet: {
    width: '100%',
    maxWidth: SHEET_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.card,
    ...SoftShadow.raised,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authBorder,
  },
  head: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  headButton: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  headSpacer: { width: MIN_TOUCH },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.title,
    lineHeight: lh(FontSize.title, 1.4),
    color: Colors.authInk,
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro),
    color: Colors.authMuted,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  loading: { marginVertical: Spacing.page },
  failed: { gap: Spacing.lg, marginTop: Spacing.xl },
  // Giữ chỗ cố định cho dòng lỗi/vòng xoay để bàn phím không nhảy lên xuống.
  status: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  error: {
    textAlign: 'center',
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.red,
  },
  forgot: { alignSelf: 'center', minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: Spacing.md },
  forgotText: { fontFamily: FontFamily.semibold, fontSize: 14, color: Colors.authPrimary },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },
});
