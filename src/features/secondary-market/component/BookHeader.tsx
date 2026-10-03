import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';

type Props = {
  title: string;
  topInset: number;
  /** Dòng phụ dưới tiêu đề, như hạng và lãi suất của khoản vay. */
  subtitle?: string;
  /** Phần bên phải hàng tiêu đề, như chấm trạng thái "Trực tiếp". */
  right?: React.ReactNode;
  /** Khối cao tối thiểu chừng này (đã gồm vùng an toàn), để thẻ đầu nằm dưới hình minh hoạ của nền. */
  minHeight?: number;
  /** Giới hạn bề rộng chữ để không đè lên linh vật của ảnh nền. */
  titleMaxWidth?: number;
};

/** Kéo nút quay lại sát lề để mũi tên gần thẳng hàng mép thẻ; vùng chạm vẫn đủ 44pt. */
const BACK_PULL = 12;

/**
 * Đầu các màn chợ Notes, cùng dáng đầu màn "Sàn khoản vay" và "Lịch sử ví": nút quay lại, tiêu đề
 * đậm màu mực xanh, phần phải tuỳ màn. Nền (ảnh sóng, linh vật) do màn tự vẽ phía sau.
 */
export default function BookHeader({ title, topInset, subtitle, right, minHeight, titleMaxWidth }: Props) {
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
        <View style={[styles.titleBlock, { maxWidth: titleMaxWidth }]}>
          <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.5}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.4}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -BACK_PULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  titleBlock: { flexShrink: 1, paddingTop: 8 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: Colors.authInk,
  },
  subtitle: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  right: { marginLeft: 'auto', minHeight: MIN_TOUCH, justifyContent: 'center' },
});
