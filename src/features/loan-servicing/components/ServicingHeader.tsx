import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';

type Props = {
  title: string;
  /** Dòng nhỏ dưới tiêu đề, như mã khoản vay; chọn được để sao chép bằng nhấn giữ. */
  subtitle?: string;
  /** `list`: tiêu đề 20pt như "Hợp đồng của tôi". `detail`: 18pt như "Chi tiết hợp đồng". */
  size?: 'list' | 'detail';
};

/** Kéo nút quay lại sát lề để mũi tên thẳng hàng mép thẻ; vùng chạm vẫn đủ 44pt. */
const BACK_PULL = 12;

const SIZES = {
  list: { icon: 26, font: 20, line: 28, tracking: -0.3 },
  detail: { icon: 24, font: 18, line: 26, tracking: -0.2 },
} as const;

/**
 * Đầu các màn khoản vay đang trả, nằm thẳng trên nền sóng như các màn hợp đồng: nút
 * quay lại, tiêu đề màu mực xanh, rồi dòng phụ nếu có. Mở thẳng từ lối tắt ở trang chủ
 * thì stack Hồ sơ có thể chỉ có màn này; `canGoBack` hỏi cả cây điều hướng nên vẫn về được.
 */
export default function ServicingHeader({ title, subtitle, size = 'detail' }: Props) {
  const nav = useNavigation();
  const s = SIZES[size];

  return (
    <View style={styles.row}>
      {nav.canGoBack() ? (
        <Pressable
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Icon name="chevronLeft" size={s.icon} color={Colors.authInk} strokeWidth={2.2} />
        </Pressable>
      ) : null}
      {/* Tâm dòng tiêu đề thẳng hàng tâm mũi tên (giữa vùng chạm 44pt). */}
      <View style={[styles.text, { paddingTop: (MIN_TOUCH - s.line) / 2 }]}>
        <Text
          style={[styles.title, { fontSize: s.font, lineHeight: s.line, letterSpacing: s.tracking }]}
          accessibilityRole="header"
          maxFontSizeMultiplier={1.4}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} selectable maxFontSizeMultiplier={1.3}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', minHeight: MIN_TOUCH },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -BACK_PULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  text: { flexShrink: 1, gap: 1 },
  title: { fontFamily: FontFamily.bold, color: Colors.authInk },
  // `authMuted` chỉ đạt ~3,4:1 trên dải sóng đậm quanh đầu trang; `ink2` vẫn là chữ phụ mà đạt AA.
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.ink2,
    marginBottom: Spacing.xs,
  },
});
