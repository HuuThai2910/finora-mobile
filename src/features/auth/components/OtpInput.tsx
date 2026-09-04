import { useId, useRef } from 'react';
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
import { FontFamily, FontSize, MIN_TOUCH, Radius, Spacing } from '@/theme';
import { OTP_LENGTH } from '../constants';

type Props = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
};

/**
 * Ô nhập mã OTP dạng nhiều ô vuông.
 *
 * Bên dưới vẫn là một `TextInput` duy nhất đặt ẩn, còn các ô vuông chỉ để hiển
 * thị. Cách này giữ được tính năng tự điền mã từ SMS/email của hệ điều hành và
 * hành vi xoá lùi chuẩn, thứ mà nhiều ô rời rạc rất dễ làm hỏng.
 */
export default function OtpInput({ value, onChange, length = OTP_LENGTH, autoFocus = true }: Props) {
  const input = useRef<TextInput>(null);
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
        {Array.from({ length }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.box,
              i < value.length && styles.boxFilled,
              i === value.length && styles.boxActive,
            ]}
          >
            <Text style={styles.digit}>{value[i] ?? ''}</Text>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={input}
        value={value}
        onChangeText={t => onChange(t.replace(/\D/g, '').slice(0, length))}
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

const styles = StyleSheet.create({
  boxes: {
    flexDirection: 'row',
    gap: Spacing.lg,
    justifyContent: 'center',
    marginVertical: Spacing.section,
  },
  // Ô trống viền trung tính; chỉ ô đang chờ nhập mới sáng màu brand để dẫn mắt,
  // ô đã có số viền đậm hơn một chút cho thấy tiến độ.
  box: {
    width: 48,
    height: 60,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: Colors.ink3 },
  boxActive: { borderColor: Colors.brand, backgroundColor: Colors.brand50 },
  digit: { fontFamily: FontFamily.bold, fontSize: FontSize.heading, color: Colors.ink },
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
    fontSize: FontSize.body,
    color: Colors.brand,
  },
});
