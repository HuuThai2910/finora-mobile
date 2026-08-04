import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, MIN_TOUCH, Radius, Spacing } from '@/theme';

export type SegmentOption<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  options: readonly SegmentOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
  /** Nhãn nhóm cho trình đọc màn hình, ví dụ "Chọn kỳ hạn". */
  label: string;
  /** Cho phép xuống dòng khi có nhiều lựa chọn (mockup chia 6 kỳ hạn thành 2 hàng). */
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Nhóm chip chọn một giá trị — mockup lặp lại ở 4 màn (chọn kỳ hạn vay,
 * kỳ hạn tái cơ cấu, phương thức ký số).
 * Mục được chọn phân biệt bằng cả nền đậm lẫn chữ đậm, không chỉ bằng màu.
 */
export default function SegmentGroup<T extends string | number>({
  options,
  value,
  onChange,
  label,
  wrap = false,
  style,
}: Props<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[styles.row, wrap && styles.wrap, style]}
    >
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
            style={({ pressed }) => [
              styles.chip,
              wrap ? styles.chipWrap : styles.chipFlex,
              active ? styles.chipActive : styles.chipIdle,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.text, active ? styles.textActive : styles.textIdle]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  wrap: { flexWrap: 'wrap' },
  chip: {
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  chipFlex: { flex: 1 },
  chipWrap: { flexGrow: 0 },
  chipActive: { backgroundColor: Colors.brand },
  chipIdle: { borderWidth: 1, borderColor: Colors.line },
  pressed: { opacity: 0.82 },
  text: { fontSize: FontSize.body },
  textActive: { fontFamily: FontFamily.bold, color: Colors.onDark },
  textIdle: { fontFamily: FontFamily.semibold, color: Colors.ink2 },
});
