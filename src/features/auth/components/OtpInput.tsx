import { useEffect, useId, useRef, useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';
import { OTP_LENGTH } from '../constants';

type Props = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
};

/**
 * Ô nhập mã OTP dạng nhiều ô vuông, trải đều hết bề rộng form như mockup.
 *
 * Bên dưới vẫn là một `TextInput` duy nhất đặt ẩn, còn các ô vuông chỉ để hiển
 * thị. Cách này giữ được tính năng tự điền mã từ SMS/email của hệ điều hành và
 * hành vi xoá lùi chuẩn, thứ mà nhiều ô rời rạc rất dễ làm hỏng.
 */
export default function OtpInput({ value, onChange, length = OTP_LENGTH, autoFocus = true }: Props) {
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  // Bàn phím số iOS không có phím Return; nhập thiếu số thì không tự đóng được.
  // Lọc id của `useId` vì React 19 chèn dấu «» và : vào đó.
  const accessoryId = `otp-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const canThanhPhu = Platform.OS === 'ios';

  return (
    <View>
      <Pressable
        onPress={() => input.current?.focus()}
        accessibilityRole="button"
        accessibilityLabel="Nhập mã OTP"
        style={styles.boxes}
      >
        {Array.from({ length }).map((_, i) => {
          // Chỉ ô đang chờ nhập mới sáng màu chủ đạo, và chỉ khi ô nhập đang được
          // chọn: đóng bàn phím thì không còn ô nào trông như đang nhận chữ.
          const active = focused && i === value.length;
          return (
            <View
              key={i}
              style={[styles.box, i < value.length && styles.boxFilled, active && styles.boxActive]}
            >
              {value[i] ? (
                <Text style={styles.digit}>{value[i]}</Text>
              ) : active ? (
                <Caret />
              ) : null}
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={input}
        value={value}
        onChangeText={t => onChange(t.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        maxLength={length}
        autoFocus={autoFocus}
        style={styles.hiddenInput}
        accessibilityLabel={`Mã xác thực gồm ${length} chữ số`}
        inputAccessoryViewID={canThanhPhu ? accessoryId : undefined}
      />

      {canThanhPhu ? (
        <InputAccessoryView nativeID={accessoryId}>
          <View style={styles.accessory}>
            <Pressable
              onPress={Keyboard.dismiss}
              hitSlop={Spacing.md}
              accessibilityRole="button"
              accessibilityLabel="Đóng bàn phím"
              style={({ pressed }) => [styles.accessoryBtn, pressed && styles.accessoryPressed]}
            >
              <Text style={styles.accessoryText}>Xong</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
    </View>
  );
}

/** Nhịp nhấp nháy gần với con trỏ của ô nhập hệ thống. */
const CARET_BLINK_MS = 530;

/**
 * Con trỏ trong ô đang chờ nhập. Ô nhập thật đang ẩn nên phải tự vẽ con trỏ để
 * người dùng biết số tiếp theo sẽ vào ô nào.
 */
function Caret() {
  const [visible, setVisible] = useState(true);

  // Timer chỉ sống khi con trỏ đang hiện; dọn ngay khi ô đổi hoặc mất focus.
  useEffect(() => {
    const id = setInterval(() => setVisible(v => !v), CARET_BLINK_MS);
    return () => clearInterval(id);
  }, []);

  return <View style={[styles.caret, !visible && styles.caretHidden]} />;
}

const styles = StyleSheet.create({
  boxes: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xxxl,
  },
  // Viền dày như nhau ở mọi trạng thái, chỉ đổi màu, để chữ số không xê dịch.
  box: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.authBorder,
    borderRadius: 10,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: Colors.authControl },
  boxActive: { borderColor: Colors.authPrimary, backgroundColor: Colors.authFocusBg },
  digit: { fontFamily: FontFamily.bold, fontSize: 22, color: Colors.authInk },
  caret: { width: 2, height: 24, borderRadius: 1, backgroundColor: Colors.authPrimary },
  caretHidden: { opacity: 0 },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  accessory: {
    alignItems: 'flex-end',
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  accessoryBtn: {
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  accessoryPressed: { opacity: 0.6 },
  accessoryText: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    color: Colors.authPrimary,
  },
});
