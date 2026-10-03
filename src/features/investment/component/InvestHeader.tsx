import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';

type Props = {
  title: string;
  topInset: number;
  /** Khối cao tối thiểu chừng này (đã gồm vùng an toàn), để thẻ đầu nằm dưới hình minh hoạ của nền. */
  minHeight?: number;
  /** Phần bên phải hàng tiêu đề, như công tắc bật/tắt. */
  right?: React.ReactNode;
};

/** Kéo nút quay lại sát lề để mũi tên gần thẳng hàng mép thẻ; vùng chạm vẫn đủ 44pt. */
const BACK_PULL = 12;

/**
 * Đầu các màn đầu tư, cùng dáng đầu màn Sàn và Lịch sử ví: nút quay lại, tiêu đề màu mực xanh.
 * Nền (sóng, linh vật) do màn tự vẽ phía sau.
 */
export default function InvestHeader({ title, topInset, minHeight, right }: Props) {
  const nav = useNavigation();
  return (
    <View style={[styles.root, { paddingTop: topInset + Spacing.xs, minHeight }]}>
      <View style={styles.row}>
        {nav.canGoBack() ? (
          <Pressable
            onPress={() => nav.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Icon name="chevronLeft" size={26} color={Colors.authInk} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.5}>
          {title}
        </Text>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {},
  row: { flexDirection: 'row', alignItems: 'center' },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -BACK_PULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  title: {
    flex: 1,
    paddingVertical: 8,
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: Colors.authInk,
  },
  right: { marginLeft: Spacing.md },
});
