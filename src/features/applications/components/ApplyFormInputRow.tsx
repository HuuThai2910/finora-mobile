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
} from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, FontSize, MIN_TOUCH, Spacing, lh } from '@/theme';
import ApplyFormFieldShell, { applyFormValueStyles } from './ApplyFormFieldShell';

/**
 * `text`: chữ tự do. `number`: bàn phím số, giữ nguyên chữ người dùng gõ để
 * validation của schema chạy y như trước. `money`: bàn phím số, hiện dấu chấm
 * ngăn nghìn nhưng giá trị lưu trong form chỉ là chữ số.
 */
export type ApplyFormInputKind = 'text' | 'number' | 'money';

type Props = {
  icon: IconName;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  kind?: ApplyFormInputKind;
  multiline?: boolean;
  required?: boolean;
  helper?: string;
  error?: string;
};

/** Ô nhiều dòng tự cao theo nội dung tới mức này rồi cuộn bên trong. */
const MULTILINE_MAX_HEIGHT = 132;

/** "15000000" → "15.000.000", đúng cách viết tiền vi-VN của app. */
const groupThousands = (digits: string): string => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/**
 * Bỏ mọi ký tự không phải số (dấu chấm vừa chèn, chữ dán vào) và số 0 thừa ở
 * đầu. Schema vẫn tự lọc chữ số lần nữa nên kết quả gửi đi không đổi.
 */
const toDigits = (text: string): string => text.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

/**
 * Dòng nhập chữ/số của bước 3/3: ô nhập thật nằm trong dòng (không có mũi tên),
 * chạm vào bất kỳ đâu trên dòng cũng đưa con trỏ vào ô.
 *
 * Bàn phím số của iOS không có phím Return nên kèm thanh phụ có nút "Xong"
 * giống `Field` dùng chung; mỗi ô một id thanh phụ, nếu không nút "Xong" của ô
 * này đóng nhầm ô khác.
 */
export default function ApplyFormInputRow({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  kind = 'text',
  multiline = false,
  required = false,
  helper,
  error,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  // `useId` của React 19 có dấu «» và :, lọc bỏ để `nativeID` chỉ còn ký tự an toàn.
  const accessoryId = `apply-form-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const numeric = kind !== 'text';
  const withDoneBar = Platform.OS === 'ios' && numeric;
  const shown = kind === 'money' ? groupThousands(value) : value;

  const change = (text: string) => onChangeText(kind === 'money' ? toDigits(text) : text);

  return (
    <>
      <ApplyFormFieldShell
        icon={icon}
        label={label}
        required={required}
        focused={focused}
        error={error}
        helper={helper}
        hideLabelFromReader
        // Đơn vị chỉ hiện khi đã có số: ô trống cần đủ chỗ cho chữ gợi ý trên màn 360pt.
        trailing={
          kind === 'money' && value ? (
            <Text style={styles.unit} accessibilityElementsHidden importantForAccessibility="no">
              đ
            </Text>
          ) : null
        }
        pressable={{ onPress: () => inputRef.current?.focus(), accessible: false }}
      >
        <TextInput
          ref={inputRef}
          value={shown}
          onChangeText={change}
          placeholder={placeholder}
          placeholderTextColor={Colors.ink3}
          keyboardType={numeric ? 'number-pad' : 'default'}
          multiline={multiline}
          autoCorrect={false}
          // Ô một dòng: phím Return đóng bàn phím thay vì chèn xuống dòng.
          returnKeyType={multiline ? undefined : 'done'}
          onSubmitEditing={multiline ? undefined : Keyboard.dismiss}
          inputAccessoryViewID={withDoneBar ? accessoryId : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onContentSizeChange={
            multiline ? (event) => setContentHeight(event.nativeEvent.contentSize.height) : undefined
          }
          accessibilityLabel={required ? `${label}, bắt buộc` : label}
          accessibilityHint={error ?? helper}
          style={[
            applyFormValueStyles.input,
            styles.input,
            !value && applyFormValueStyles.placeholder,
            multiline && styles.multiline,
            multiline && contentHeight !== null && { height: Math.min(contentHeight, MULTILINE_MAX_HEIGHT) },
          ]}
        />
      </ApplyFormFieldShell>

      {withDoneBar ? (
        <InputAccessoryView nativeID={accessoryId}>
          <View style={styles.accessory}>
            <Pressable
              onPress={Keyboard.dismiss}
              hitSlop={Spacing.md}
              accessibilityRole="button"
              accessibilityLabel="Đóng bàn phím"
              style={({ pressed }) => [styles.accessoryButton, pressed && styles.accessoryPressed]}
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
    // Trên web trình duyệt tự vẽ khung focus bên trong ô; viền dòng đã báo focus rồi.
    // Chrome vẽ khung kiểu `auto` và bỏ qua độ dày, nên phải đổi kiểu mới tắt được.
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  multiline: { textAlignVertical: 'top', maxHeight: MULTILINE_MAX_HEIGHT },
  unit: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.authMuted,
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
  accessoryPressed: { opacity: 0.6 },
  accessoryText: { fontFamily: FontFamily.semibold, fontSize: FontSize.body, color: Colors.authPrimary },
});
