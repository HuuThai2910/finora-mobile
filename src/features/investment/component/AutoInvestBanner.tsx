import { Image, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import { AUTO_INVEST_HERO } from '../constant';
import InvestHeader from './InvestHeader';

/**
 * Dải màu phủ phía trên banner cao dư ra: kéo nội dung xuống (iOS) thì phần lộ ra vẫn liền màu
 * hàng đầu của ảnh thay vì trơ màu nền.
 */
const OVERSCROLL_COVER = 600;
/** Khoảng giữa chân robot và mép trên thẻ đầu tiên. */
const GROUND_GAP = Spacing.xs;

/** Ảnh canh phải, phóng để đoạn từ `cropLeft` tới mép phải vừa khít cột. */
function geometry(width: number) {
  const scale = width / (AUTO_INVEST_HERO.width - AUTO_INVEST_HERO.cropLeft);
  return {
    imageWidth: AUTO_INVEST_HERO.width * scale,
    imageHeight: AUTO_INVEST_HERO.height * scale,
    left: -AUTO_INVEST_HERO.cropLeft * scale,
    ground: AUTO_INVEST_HERO.groundRow * scale,
  };
}

type Props = {
  /** Bề rộng cột nội dung (đã giới hạn trên web). */
  width: number;
  topInset: number;
};

/**
 * Đầu màn Auto-Invest: ba robot làm việc trên sàn phía sau, hàng quay lại + tiêu đề phía trên. Khối
 * cao tới chân robot để thẻ trạng thái nằm ngay dưới; banner lùi theo vùng an toàn cùng tiêu đề
 * nên trên máy có tai thỏ robot vẫn nằm dưới hàng tiêu đề.
 */
export default function AutoInvestBanner({ width, topInset }: Props) {
  const { imageWidth, imageHeight, left, ground } = geometry(width);
  const skyHeight = OVERSCROLL_COVER + topInset;

  return (
    <View style={{ height: topInset + ground + GROUND_GAP }}>
      <View
        style={[styles.art, { width, top: -OVERSCROLL_COVER, height: skyHeight + imageHeight }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.sky, { height: skyHeight }]} />
        <Image
          source={AUTO_INVEST_HERO.source}
          style={[styles.image, { top: skyHeight, left, width: imageWidth, height: imageHeight }]}
        />
      </View>
      <InvestHeader title="Auto-Invest" topInset={topInset} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Cắt phần ảnh tràn trái nhưng để ảnh chảy xuống sau thẻ đầu tiên.
  art: { position: 'absolute', left: 0, overflow: 'hidden', pointerEvents: 'none' },
  sky: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: Colors.marketSky },
  image: { position: 'absolute' },
});
