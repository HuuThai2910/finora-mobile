import { useId, useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
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
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  label: string;
  /**
   * Icon đứng đầu ô nhập, giúp nhận ra loại ô mà không cần đọc nhãn. Bỏ trống
   * khi mockup không vẽ icon (màn đặt lại mật khẩu: hai ô cùng loại, nhãn đã đủ rõ).
   */
  icon?: IconName;
  value: string;
  onChangeText: (value: string) => void;
  /** Cho màn validate ngay khi người dùng rời ô nhập. */
  onBlur?: () => void;
  placeholder?: string;
  secure?: boolean;
  required?: boolean;
  /** Chữ gợi ý dưới ô; bị thay bằng lỗi khi ô có lỗi. */
  helper?: string;
  error?: string;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoComplete?: TextInputProps['autoComplete'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
  /** Để màn chuyển con trỏ sang ô kế tiếp khi bấm phím Return. */
  inputRef?: React.Ref<TextInput>;
  style?: StyleProp<ViewStyle>;
};

const ICON_SIZE = 20;

/**
 * Bàn phím số của iOS không có phím Return nên không tự đóng được; các kiểu
 * dưới đây phải kèm thanh phụ có nút "Xong" (giống `Field` dùng chung).
 */
const BAN_PHIM_SO: ReadonlySet<KeyboardTypeOptions> = new Set<KeyboardTypeOptions>([
  'number-pad',
  'numeric',
  'decimal-pad',
  'phone-pad',
]);

/**
 * Ô nhập của nhóm màn tài khoản theo mockup mới: nhãn đậm phía trên, icon
 * trong ô, viền sáng màu chủ đạo khi focus. Ô mật khẩu có nút ẩn/hiện để
 * người dùng tự soát lỗi gõ trên bàn phím điện thoại.
 */
export default function AuthField({
  label,
  icon,
  value,
  onChangeText,
  onBlur,
  placeholder,
  secure = false,
  required = false,
  helper,
  error,
  editable = true,
  keyboardType,
  autoComplete,
  autoCapitalize,
  returnKeyType,
  onSubmitEditing,
  inputRef,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Mỗi ô cần id thanh phụ riêng, nếu không nút "Xong" của ô này đóng nhầm ô khác.
  // `useId` của React 19 có dấu «» và :, lọc bỏ để `nativeID` chỉ còn ký tự an toàn.
  const accessoryId = `auth-field-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const canThanhPhu = Platform.OS === 'ios' && !!keyboardType && BAN_PHIM_SO.has(keyboardType);

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <View
        style={[
          styles.box,
          focused && styles.boxFocused,
          !!error && styles.boxError,
          !editable && styles.boxReadOnly,
        ]}
      >
        {icon ? (
          <Icon
            name={icon}
            size={ICON_SIZE}
            color={focused ? Colors.authPrimary : Colors.ink3}
            strokeWidth={1.8}
          />
        ) : null}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.ink3}
          secureTextEntry={secure && !revealed}
          keyboardType={keyboardType}
          editable={editable}
          autoComplete={autoComplete}
          autoCapitalize={secure ? 'none' : autoCapitalize}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          // Giữ bàn phím khi Return chỉ để nhảy sang ô kế tiếp, tránh bàn phím sụp rồi bật lại.
          submitBehavior={returnKeyType === 'next' ? 'submit' : 'blurAndSubmit'}
          inputAccessoryViewID={canThanhPhu ? accessoryId : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          accessibilityLabel={label}
          accessibilityHint={helper}
          style={styles.input}
        />

        {secure ? (
          <Pressable
            onPress={() => setRevealed(v => !v)}
            hitSlop={Spacing.lg}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            <Icon
              name={revealed ? 'eyeOff' : 'eye'}
              size={ICON_SIZE}
              color={Colors.ink3}
              strokeWidth={1.8}
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
  wrap: { marginBottom: Spacing.xl },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authLabel,
    marginBottom: Spacing.sm,
  },
  required: { color: Colors.red },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    height: 46,
    paddingHorizontal: Spacing.xl,
    // Viền giữ nguyên độ dày ở mọi trạng thái, chỉ đổi màu — đổi độ dày khi
    // focus làm chữ bên trong xê dịch 1px trông rất khó chịu.
    borderWidth: 1,
    borderColor: Colors.authBorder,
    borderRadius: 12,
    backgroundColor: Colors.card,
  },
  boxFocused: { borderColor: Colors.authPrimary },
  boxError: { borderColor: Colors.red },
  boxReadOnly: { backgroundColor: Colors.surfaceMuted },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Colors.ink,
    // Trên web trình duyệt tự vẽ thêm khung focus bên trong ô; viền ô đã báo focus rồi.
    outlineWidth: 0,
  },
  helper: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.ink3,
    marginTop: Spacing.sm,
  },
  error: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.red,
    marginTop: Spacing.sm,
  },
  accessory: {
    alignItems: 'flex-end',
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  accessoryBtn: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  accessoryPressed: { opacity: 0.6 },
  accessoryText: { fontFamily: FontFamily.semibold, fontSize: 16, color: Colors.authPrimary },
});
