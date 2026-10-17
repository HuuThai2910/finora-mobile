import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';
import { COUNTER_FROM, MAX_MESSAGE_CHARS, SENSITIVE_HINT } from '../constants';

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  /** Chưa đọc thông báo AI hoặc trợ lý đang tắt. */
  disabled: boolean;
};

/**
 * Ô nhập câu hỏi ghim đáy màn chat. Giới hạn 1000 ký tự như server; nút gửi tắt khi ô trống hoặc
 * đang chờ câu trả lời (chống gửi hai lần). Dòng nhắc dưới ô nhắc lại: không nhập CCCD, PIN, OTP.
 */
export default function ChatComposer({ value, onChange, onSend, sending, disabled }: Props) {
  const canSend = !disabled && !sending && value.trim().length > 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.box}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Hỏi về hồ sơ, khoản vay, lệnh..."
          placeholderTextColor={Colors.authMuted}
          multiline
          maxLength={MAX_MESSAGE_CHARS}
          editable={!disabled}
          accessibilityLabel="Câu hỏi cho trợ lý"
          style={styles.input}
        />
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Gửi câu hỏi"
          accessibilityState={{ disabled: !canSend, busy: sending }}
          style={({ pressed }) => [styles.send, !canSend && styles.sendOff, pressed && styles.pressed]}
        >
          {sending ? (
            <ActivityIndicator size="small" color={Colors.onDark} />
          ) : (
            <Icon name="arrowUp" size={22} color={Colors.onDark} />
          )}
        </Pressable>
      </View>
      <View style={styles.meta}>
        <Text style={styles.hint} maxFontSizeMultiplier={1.3}>
          {SENSITIVE_HINT}
        </Text>
        {value.length > COUNTER_FROM ? (
          <Text style={styles.hint} accessibilityLiveRegion="polite">
            {value.length}/{MAX_MESSAGE_CHARS}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const SEND = 40;

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  box: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
    paddingLeft: Spacing.lg,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  input: {
    flex: 1,
    minHeight: MIN_TOUCH - 4,
    maxHeight: 120,
    paddingVertical: 10,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.authInk,
  },
  send: {
    width: SEND,
    height: SEND,
    borderRadius: SEND / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.authPrimary,
  },
  sendOff: { backgroundColor: Colors.authControl },
  pressed: { opacity: 0.75 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, paddingHorizontal: Spacing.sm },
  hint: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
});
