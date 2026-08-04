import { useState } from 'react';
import {
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
import { FontFamily, FontSize, MIN_TOUCH, Radius, Spacing, lh } from '@/theme';

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
  style?: StyleProp<ViewStyle>;
};

/**
 * `.field` của mockup: nhãn nhìn thấy được + ô nhập, viền sáng lên khi focus.
 * Nhãn luôn hiện chứ không dùng placeholder thay nhãn.
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
  style,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.ink3}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label}
        accessibilityHint={helper}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          !editable && styles.inputReadOnly,
        ]}
      />

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
    minHeight: Math.max(MIN_TOUCH, 60),
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body),
    color: Colors.ink,
  },
  inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
  inputFocused: { borderColor: Colors.brand, borderWidth: 2 },
  inputError: { borderColor: Colors.red, borderWidth: 2 },
  inputReadOnly: { backgroundColor: Colors.surfaceMuted, color: Colors.ink2 },
  helper: { fontFamily: FontFamily.regular, fontSize: FontSize.micro, color: Colors.ink3 },
  error: { fontFamily: FontFamily.semibold, fontSize: FontSize.micro, color: Colors.red },
});
