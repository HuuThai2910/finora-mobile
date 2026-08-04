import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, MIN_TOUCH, Spacing, Text_, tabularNums } from '@/theme';
import Icon from '@/components/ui/Icon';

type Props = {
  /** Nhãn bên trái. */
  label: React.ReactNode;
  /** Chữ phụ dưới nhãn. */
  sub?: string;
  /** Giá trị bên phải — chuỗi được bọc sẵn kiểu chữ đậm, node thì giữ nguyên. */
  value?: React.ReactNode;
  /** Tô màu giá trị theo chiều tiền vào/ra. */
  valueTone?: 'up' | 'down' | 'brand';
  /** Icon nhỏ đứng trước nhãn (dùng ở màn Hồ sơ). */
  icon?: React.ComponentProps<typeof Icon>['name'];
  onPress?: () => void;
  /** Ẩn đường kẻ dưới — dùng cho dòng cuối danh sách. */
  last?: boolean;
  style?: StyleProp<ViewStyle>;
};

const TONES = {
  up: Colors.green,
  down: Colors.red,
  brand: Colors.brand,
} as const;

/**
 * `.p-item` của mockup — dòng dữ liệu hai cột có kẻ chân.
 * Đây là khối lặp nhiều nhất trong toàn bộ 29 màn.
 */
export default function PItem({
  label,
  sub,
  value,
  valueTone,
  icon,
  onPress,
  last = false,
  style,
}: Props) {
  const body = (
    <>
      <View style={styles.left}>
        {icon ? <Icon name={icon} size={IconSize.sm} color={Colors.brand} /> : null}
        <View style={styles.labelWrap}>
          {typeof label === 'string' ? <Text style={styles.label}>{label}</Text> : label}
          {sub ? <Text style={styles.sub}>{sub}</Text> : null}
        </View>
      </View>

      <View style={styles.right}>
        {typeof value === 'string' ? (
          <Text style={[styles.value, valueTone && { color: TONES[valueTone] }]}>{value}</Text>
        ) : (
          value
        )}
        {onPress ? <Icon name="chevronRight" size={IconSize.xs} color={Colors.ink3} /> : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.row,
          !last && styles.divider,
          pressed && styles.pressed,
          style,
        ]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={[styles.row, !last && styles.divider, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    minHeight: MIN_TOUCH,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  pressed: { opacity: 0.6 },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, flexShrink: 1 },
  labelWrap: { flexShrink: 1, gap: 2 },
  label: { ...Text_.body, color: Colors.ink },
  sub: { ...Text_.micro, color: Colors.ink3 },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexShrink: 0 },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
    color: Colors.ink,
    textAlign: 'right',
    ...tabularNums,
  },
});
