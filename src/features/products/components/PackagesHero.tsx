import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';
import { PACKAGES_HERO, PACKAGES_PADDING } from '../constant';

/**
 * Dải màu phủ phía trên ảnh, cao dư ra: kéo làm mới trên iOS đẩy nội dung xuống,
 * phần lộ ra vẫn liền màu hàng đầu của ảnh thay vì trơ màu nền. Cộng thêm phần
 * ảnh nằm sau hàng tiêu đề nên phải đủ cao cho cả hai.
 */
const OVERSCROLL_COVER = 800;
/** Khoảng giữa dòng phụ và đỉnh ăng-ten robot. */
const ART_TOP_GAP = Spacing.sm;
/** Khoảng giữa đáy hộp quà / chồng xu và mép trên thẻ gói đầu tiên. */
const GROUND_GAP = Spacing.sm;
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
  const scale = width / (PACKAGES_HERO.width - PACKAGES_HERO.cropLeft);
  return {
    imageWidth: PACKAGES_HERO.width * scale,
    imageHeight: PACKAGES_HERO.height * scale,
    left: -PACKAGES_HERO.cropLeft * scale,
    objectTop: PACKAGES_HERO.objectTop * scale,
    objectHeight: (PACKAGES_HERO.groundRow - PACKAGES_HERO.objectTop) * scale,
  };
}

type Props = {
  /** Bề rộng cột nội dung (đã giới hạn trên web). */
  width: number;
  topInset: number;
};

/**
 * Đầu màn "Gói vay ưu đãi" (mockup 26/09/2026): hàng quay lại + tiêu đề + kính
 * lúp, dòng phụ, rồi banner robot cầm hộp quà.
 *
 * Khung banner được neo vào dòng phụ chứ không vào đỉnh màn: đỉnh nhóm hình luôn
 * nằm ngay dưới dòng phụ dù vùng an toàn cao bao nhiêu hay chữ phóng to làm dòng
 * phụ xuống hai dòng. Phần trời phía trên nhóm hình chui ra sau hàng tiêu đề, phần
 * đuôi ảnh (nền tuyết trơn) lùi sau thẻ đầu tiên.
 */
export default function PackagesHero({ width, topInset }: Props) {
  const nav = useNavigation();
  const canGoBack = nav.canGoBack();
  const { imageWidth, imageHeight, left, objectTop, objectHeight } = geometry(width);
  // Toạ độ so với đỉnh khung banner: ảnh bắt đầu cao hơn khung một đoạn `objectTop`.
  const imageTop = ART_TOP_GAP - objectTop;
  const skyHeight = OVERSCROLL_COVER + topInset;

  return (
    <View>
      {/* Chữ vẽ đè lên phần trời của ảnh: đặt trên lớp ảnh dù đứng trước trong cây. */}
      <View style={[styles.text, { paddingTop: topInset + Spacing.xs }]}>
        <View style={styles.header}>
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
            Gói vay ưu đãi
          </Text>
          {/* Chưa có tìm kiếm gói vay: giữ biểu tượng như mockup nhưng không làm
              nút, tránh một nút bấm không làm gì. */}
          <View style={styles.search} {...hiddenFromReader}>
            <Icon name="search" size={24} color={Colors.authInk} />
          </View>
        </View>
        <Text style={styles.lead} maxFontSizeMultiplier={1.4}>
          Chọn gói phù hợp – lãi suất ưu đãi theo sản phẩm
        </Text>
      </View>

      <View style={{ height: ART_TOP_GAP + objectHeight + GROUND_GAP }} {...hiddenFromReader}>
        <View
          style={[
            styles.art,
            { width, top: imageTop - skyHeight, height: skyHeight + imageHeight },
          ]}
        >
          <View style={[styles.sky, { height: skyHeight }]} />
          <Image
            source={PACKAGES_HERO.source}
            style={[styles.image, { top: skyHeight, left, width: imageWidth, height: imageHeight }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { zIndex: 1 },
  // Cắt phần ảnh tràn trái (ảnh rộng hơn cột) nhưng để ảnh chảy lên sau tiêu đề
  // và xuống sau thẻ đầu tiên.
  art: { position: 'absolute', left: 0, overflow: 'hidden', pointerEvents: 'none' },
  sky: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: Colors.packagesSky },
  image: { position: 'absolute' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: PACKAGES_PADDING },
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
  lead: {
    paddingHorizontal: PACKAGES_PADDING,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.authMuted,
  },
});
