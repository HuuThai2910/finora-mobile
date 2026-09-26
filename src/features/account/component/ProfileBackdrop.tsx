import { Image, StyleSheet, View } from 'react-native';
import { PROFILE_BACKGROUND } from '../constant';

type Props = {
  /** Bề rộng cột nội dung; ảnh phóng theo bề rộng này chứ không theo cửa sổ. */
  width: number;
};

/**
 * Lớp sóng sau phần đầu màn Hồ sơ, cuộn cùng nội dung như mockup: sóng luôn
 * nằm sau tên và nhãn định danh, phía dưới là màu nền trơn của cột.
 *
 * Ảnh giữ nguyên tỉ lệ (phóng theo bề rộng cột) và chỉ bị xén ở hàng `wavesEnd`,
 * nơi ảnh đã cùng màu với nền cột — không kéo giãn, không lộ vết nối.
 */
export default function ProfileBackdrop({ width }: Props) {
  const bg = PROFILE_BACKGROUND;
  const scale = width / bg.width;

  return (
    <View style={[styles.slice, { height: bg.wavesEnd * scale }]} aria-hidden>
      <Image source={bg.source} style={{ width, height: bg.height * scale }} />
    </View>
  );
}

const styles = StyleSheet.create({
  slice: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
});
