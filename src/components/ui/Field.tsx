import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, MIN_TOUCH, Radius, Spacing } from '@/theme';
import Icon from './Icon';

type Props = {
  label: string;
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  /** Nhiều dòng — tương ứng `<textarea>` trong mockup. */
  multiline?: boolean;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  /** Chữ gợi ý luôn hiển thị dưới ô, không dùng placeholder thay nhãn. */
  helper?: string;
  /** Lỗi hiển thị ngay dưới ô liên quan. */
  error?: string;
  required?: boolean;
  editable?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  /** Email và mã không được tự viết hoa chữ đầu như bàn phím mặc định. */
  autoCapitalize?: TextInputProps['autoCapitalize'];
  /** Cho screen validate ngay khi người dùng rời ô nhập. */
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * `.field` của mockup: nhãn nhìn thấy được + ô nhập, viền sáng lên khi focus.
 * Nhãn luôn hiện chứ không dùng placeholder thay nhãn.
 * Ô mật khẩu có nút ẩn/hiện để người dùng tự soát lỗi gõ trên bàn phím điện thoại.
 */
export default function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  secure = false,
  keyboardType,
  helper,
  error,
  required = false,
  editable = true,
  autoComplete,
  autoCapitalize,
  onBlur,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.ink3}
          secureTextEntry={secure && !revealed}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
          autoComplete={autoComplete}
          autoCapitalize={secure ? 'none' : autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          accessibilityLabel={label}
          accessibilityHint={helper}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            secure && styles.inputSecure,
            focused && styles.inputFocused,
            !!error && styles.inputError,
            !editable && styles.inputReadOnly,
          ]}
        />

        {secure ? (
          <Pressable
            onPress={() => setRevealed(v => !v)}
            hitSlop={Spacing.lg}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            style={styles.toggle}
          >
            <Icon
              name={revealed ? 'eyeOff' : 'eye'}
              size={IconSize.xs}
              color={Colors.ink3}
              strokeWidth={1.7}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md, marginBottom: Spacing.xl },
  label: { fontFamily: FontFamily.semibold, fontSize: FontSize.body, color: Colors.ink2 },
  required: { color: Colors.red },
  input: {
    minHeight: Math.max(MIN_TOUCH, 52),
    // Viền giữ nguyên độ dày ở mọi trạng thái, chỉ đổi màu — đổi độ dày khi
    // focus làm chữ bên trong xê dịch 1px trông rất khó chịu.
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    // Không đặt lineHeight cho TextInput: giá trị cứng làm phần thấp của
    // "g", "y" bị cắt trên Android; để hệ thống tự tính theo font.
    color: Colors.ink,
  },
  inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
  // Chừa chỗ cho nút ẩn/hiện để chữ dài không chui xuống dưới icon.
  inputSecure: { paddingRight: Spacing.xl + IconSize.xs + Spacing.lg },
  inputFocused: { borderColor: Colors.brand },
  inputError: { borderColor: Colors.red },
  inputReadOnly: { backgroundColor: Colors.surfaceMuted, color: Colors.ink2 },
  toggle: {
    position: 'absolute',
    right: Spacing.xl,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  helper: { fontFamily: FontFamily.regular, fontSize: FontSize.micro, color: Colors.ink3 },
  error: { fontFamily: FontFamily.semibold, fontSize: FontSize.micro, color: Colors.red },
});
