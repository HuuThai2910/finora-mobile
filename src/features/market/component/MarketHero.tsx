import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';
import { MARKET_HERO, MARKET_PADDING } from '../constant';

/**
 * Dải màu phủ phía trên banner cao dư ra: kéo làm mới trên iOS đẩy nội dung
 * xuống, phần lộ ra vẫn liền màu hàng đầu của ảnh thay vì trơ màu nền.
 */
const OVERSCROLL_COVER = 600;
/** Khoảng giữa chân robot và mép trên thẻ khoản vay đầu tiên. */
const GROUND_GAP = Spacing.xs;
/** Kéo nút quay lại sát lề để mũi tên gần thẳng hàng mép thẻ; vùng chạm vẫn đủ 44pt. */
const BACK_PULL = 12;

/**
 * Ảnh thuần trang trí. `aria-hidden` được View của React Native đổi sang cặp
 * `accessibilityElementsHidden` / `importantForAccessibility` trên iOS/Android,
 * còn react-native-web giữ nguyên cho DOM.
 */
const hiddenFromReader = { 'aria-hidden': true } as const;

/** Ảnh canh phải, phóng để đoạn từ `cropLeft` tới mép phải vừa khít cột. */
function geometry(width: number) {
  const scale = width / (MARKET_HERO.width - MARKET_HERO.cropLeft);
  return {
    imageWidth: MARKET_HERO.width * scale,
    imageHeight: MARKET_HERO.height * scale,
    left: -MARKET_HERO.cropLeft * scale,
    ground: MARKET_HERO.groundRow * scale,
  };
}

type Props = {
  /** Bề rộng cột nội dung (đã giới hạn trên web). */
  width: number;
  topInset: number;
};

/**
 * Đầu màn "Sàn khoản vay" (mockup 26/09/2026): banner robot phía sau, hàng nút
 * quay lại + tiêu đề + kính lúp phía trên. Khối này cao tới chân robot để thẻ đầu
 * tiên nằm ngay dưới, còn phần đuôi banner (nền trơn) lùi sau thẻ.
 *
 * Banner lùi xuống theo vùng an toàn cùng tiêu đề, nên trên máy có tai thỏ robot
 * vẫn nằm dưới hàng tiêu đề như mockup.
 */
export default function MarketHero({ width, topInset }: Props) {
  const nav = useNavigation();
  // Sàn là màn gốc của tab; quay lại vẫn được nhờ lịch sử tab (về Trang chủ),
  // nên hỏi `canGoBack` của cả cây điều hướng.
  const canGoBack = nav.canGoBack();
  const { imageWidth, imageHeight, left, ground } = geometry(width);
  const skyHeight = OVERSCROLL_COVER + topInset;

  return (
    <View style={{ height: topInset + ground + GROUND_GAP }}>
      <View
        style={[styles.art, { width, top: -OVERSCROLL_COVER, height: skyHeight + imageHeight }]}
        {...hiddenFromReader}
      >
        <View style={[styles.sky, { height: skyHeight }]} />
        <Image
          source={MARKET_HERO.source}
          style={[styles.image, { top: skyHeight, left, width: imageWidth, height: imageHeight }]}
        />
      </View>

      <View style={[styles.header, { paddingTop: topInset + Spacing.xs }]}>
        {canGoBack ? (
          <Pressable
            onPress={() => nav.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Icon name="chevronLeft" size={26} color={Colors.authInk} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          Sàn khoản vay
        </Text>
        {/* Chưa có tìm kiếm trên sàn (Investment Service chưa có tham số lọc): giữ
            biểu tượng như mockup nhưng không làm nút, tránh một nút bấm không làm gì. */}
        <View style={styles.search} {...hiddenFromReader}>
          <Icon name="search" size={24} color={Colors.authInk} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Cắt phần ảnh tràn trái (ảnh rộng hơn cột) nhưng để ảnh chảy xuống sau thẻ đầu.
  art: { position: 'absolute', left: 0, overflow: 'hidden', pointerEvents: 'none' },
  sky: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: Colors.marketSky },
  image: { position: 'absolute' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MARKET_PADDING,
  },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -BACK_PULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: Colors.authInk,
  },
  search: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'flex-end', justifyContent: 'center' },
});
