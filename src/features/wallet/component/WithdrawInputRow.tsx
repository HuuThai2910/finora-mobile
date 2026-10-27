import { useId, useRef, useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, FontSize, MIN_TOUCH, Spacing, lh } from '@/theme';
import WithdrawField, { withdrawValueStyles } from './WithdrawField';

type Props = {
  icon: IconName;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  /** `digits`: bàn phím số, chỉ giữ chữ số (số tài khoản). `name`: chữ, tự viết hoa trên bàn phím. */
  kind: 'digits' | 'name';
  maxLength: number;
  helper?: string;
  error?: string;
};

/**
 * Dòng nhập chữ/số của form rút tiền: ô nhập thật nằm trong dòng, chạm vào bất kỳ đâu trên dòng cũng đưa con trỏ
 * vào ô.
 *
 * Ô tên không tự đổi chữ khi đang gõ (sửa giá trị trong lúc bộ gõ tiếng Việt đang ghép dấu làm hỏng chữ); tên được
 * chuẩn hoá viết hoa lúc gửi. Bàn phím số của iOS không có phím Return nên kèm thanh phụ "Xong", mỗi ô một id riêng.
 */
export default function WithdrawInputRow({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  kind,
  maxLength,
  helper,
  error,
}: Props) {
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);
  // `useId` của React 19 có dấu «» và :, lọc bỏ để `nativeID` chỉ còn ký tự an toàn.
  const accessoryId = `withdraw-input-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const digits = kind === 'digits';
  const withDoneBar = Platform.OS === 'ios' && digits;

  const change = (text: string) => onChangeText(digits ? text.replace(/\D/g, '') : text);

  return (
    <>
      <WithdrawField
        icon={icon}
        label={label}
        focused={focused}
        error={error}
        helper={helper}
        hideLabelFromReader
        pressable={{ onPress: () => inputRef.current?.focus(), accessible: false }}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={change}
          placeholder={placeholder}
          placeholderTextColor={Colors.ink3}
          keyboardType={digits ? 'number-pad' : 'default'}
          autoCapitalize={digits ? 'none' : 'characters'}
          autoCorrect={false}
          autoComplete="off"
          maxLength={maxLength}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          inputAccessoryViewID={withDoneBar ? accessoryId : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          accessibilityHint={error ?? helper}
          style={[withdrawValueStyles.input, styles.input, !value && withdrawValueStyles.placeholder]}
          maxFontSizeMultiplier={1.4}
        />
      </WithdrawField>

      {withDoneBar ? (
        <InputAccessoryView nativeID={accessoryId}>
          <View style={styles.accessory}>
            <Pressable
              onPress={Keyboard.dismiss}
              hitSlop={Spacing.md}
              accessibilityRole="button"
              accessibilityLabel="Đóng bàn phím"
              style={({ pressed }) => [styles.accessoryButton, pressed && styles.pressed]}
            >
              <Text style={styles.accessoryText}>Xong</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    // Cao ít nhất bằng một dòng chữ giá trị để dòng trống và dòng đã nhập cao như nhau.
    minHeight: lh(FontSize.body, 1.4),
    paddingVertical: 0,
    paddingHorizontal: 0,
    // Trên web trình duyệt tự vẽ khung focus kiểu `auto` (bỏ qua độ dày), phải đổi kiểu mới tắt được; viền dòng
    // đã báo focus rồi.
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  accessory: {
    alignItems: 'flex-end',
    backgroundColor: Colors.authFocusBg,
    borderTopWidth: 1,
    borderTopColor: Colors.authBorder,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  accessoryButton: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  pressed: { opacity: 0.6 },
  accessoryText: { fontFamily: FontFamily.semibold, fontSize: FontSize.body, color: Colors.authPrimary },
});
