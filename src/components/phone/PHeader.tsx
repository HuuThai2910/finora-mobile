import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { FontSize, IconSize, MIN_TOUCH, Spacing, Text_ } from '@/theme';
import Icon from '@/components/ui/Icon';

type Props = {
  title: string;
  /** Nội dung bên phải: icon, tag hoặc chữ phụ. */
  right?: React.ReactNode;
  /** Chữ phụ bên phải — lối tắt cho trường hợp phổ biến nhất trong mockup. */
  hint?: string;
  /**
   * Hiện nút quay lại. Mockup là ảnh tĩnh nên không vẽ nút này, nhưng màn đẩy
   * chồng trong app thật cần lối thoát nhìn thấy được (Android không có cử chỉ
   * vuốt-về như iOS).
   */
  back?: boolean;
};

/** `.p-hd` của mockup — tiêu đề trái, phụ kiện phải. */
export default function PHeader({ title, right, hint, back = false }: Props) {
  const nav = useNavigation();
  const canGoBack = back && nav.canGoBack();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {canGoBack ? (
          <Pressable
            onPress={() => nav.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            hitSlop={Spacing.lg}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <Icon name="chevronLeft" size={IconSize.md} color={Colors.ink} />
          </Pressable>
        ) : null}
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
      </View>

      {right ?? (hint ? <Text style={styles.hint}>{hint}</Text> : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexShrink: 1 },
  backBtn: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  title: { ...Text_.title, color: Colors.ink, flexShrink: 1 },
  hint: { ...Text_.micro, color: Colors.ink3, fontSize: FontSize.micro },
});
