import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, IconSize, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  /** Màn khác dùng lại ô này (Sàn khoản vay) thì đổi chữ gợi ý và nhãn đọc cho đúng thứ đang tìm. */
  placeholder?: string;
  accessibilityLabel?: string;
};

/** Ô lọc theo từ khoá, hiện ngay dưới đầu màn khi bấm biểu tượng kính lúp (Sản phẩm vay, Sàn khoản vay). */
export default function ProductSearchField({
  value,
  onChangeText,
  onClear,
  placeholder = 'Tìm theo tên sản phẩm',
  accessibilityLabel = 'Tìm sản phẩm vay theo tên',
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <Icon name="search" size={IconSize.xs} color={focused ? Colors.authPrimary : Colors.authMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={Colors.authMuted}
        accessibilityLabel={accessibilityLabel}
        // Người dùng vừa bấm kính lúp để tìm, nên mở sẵn bàn phím.
        autoFocus
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        style={[styles.input, !value && styles.inputTrailing]}
      />
      {value ? (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Xoá từ khoá"
          style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
        >
          <Icon name="x" size={IconSize.xs} color={Colors.authMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 48,
    paddingLeft: Spacing.lg,
    // Viền giữ nguyên độ dày, chỉ đổi màu khi focus để chữ bên trong không xê dịch.
    borderWidth: 1,
    borderColor: Colors.authBorder,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  fieldFocused: { borderColor: Colors.authPrimary },
  input: {
    flex: 1,
    paddingVertical: Spacing.lg,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Colors.authInk,
    // Trình duyệt tự vẽ khung focus kiểu `auto` quanh thẻ input, và kiểu này bỏ qua
    // độ dày 0; đổi sang `solid` thì độ dày 0 mới có tác dụng. Viền xanh của ô đã
    // thay nó báo focus.
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  // Chưa có nút xoá thì chừa lề phải, để chữ dài không chạm viền ô.
  inputTrailing: { marginRight: Spacing.lg },
  // Nút xoá chiếm trọn chiều cao ô để vùng chạm đủ 44pt mà ô không phải cao thêm.
  clear: {
    width: MIN_TOUCH,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
});
