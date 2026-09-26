import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { WaveBackground } from '@/constants/backgrounds';

type Props = {
  background: WaveBackground;
  /** Bề rộng cột nội dung; ảnh phóng theo bề rộng này chứ không theo cửa sổ. */
  width: number;
};

/**
 * Nền sóng phủ hết chiều cao của khối cha và cuộn cùng nội dung: lớp sóng trên
 * nằm sau đầu trang, lớp sóng đáy lộ ra dưới thẻ cuối. Đặt làm con đầu tiên của
 * khối nội dung (khối đó cần `minHeight` bằng khung cuộn để sóng đáy sát đáy màn).
 *
 * Không trải nguyên ảnh cho cả màn: ảnh gần vuông, kéo dài ra sẽ méo dáng sóng.
 * Chỉ lấy dải trên và dải đáy; khoảng giữa là dải màu bắt đầu và kết thúc đúng
 * màu ở hai đường cắt nên không lộ vết nối.
 */
export default function WaveBackdrop({ background: bg, width }: Props) {
  const imageWidth = width * bg.zoom;
  const scale = imageWidth / bg.width;
  const topHeight = bg.topEnd * scale;
  const bottomHeight = (bg.height - bg.bottomStart) * scale;

  const image = {
    position: 'absolute' as const,
    left: -(imageWidth - width) * bg.focusX,
    width: imageWidth,
    height: bg.height * scale,
  };

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient
        colors={[bg.middleFrom, bg.middleTo]}
        style={[styles.middle, { top: topHeight, bottom: bottomHeight }]}
      />
      <View style={[styles.slice, styles.top, { height: topHeight }]}>
        <Image source={bg.source} resizeMode="cover" style={[image, { top: 0 }]} />
      </View>
      <View style={[styles.slice, styles.bottom, { height: bottomHeight }]}>
        <Image
          source={bg.source}
          resizeMode="cover"
          style={[image, { top: -bg.bottomStart * scale }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  middle: { position: 'absolute', left: 0, right: 0 },
  slice: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  top: { top: 0 },
  bottom: { bottom: 0 },
});
