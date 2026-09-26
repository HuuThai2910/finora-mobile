import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { APPLICATIONS_BACKGROUND } from '../constant';

const bg = APPLICATIONS_BACKGROUND;

/**
 * Dải màu phủ phía trên ảnh cao dư ra: kéo làm mới trên iOS đẩy nội dung xuống,
 * phần lộ ra phía trên vẫn liền màu với mép ảnh thay vì trơ màu nền.
 */
const OVERSCROLL_COVER = 600;

/** Hàng trên cùng của ảnh, dựng lại bằng bốn điểm màu đo bằng PIL. */
const SKY_COLORS = [
  Colors.applicationsSkyLeft,
  Colors.applicationsSkyMid,
  Colors.applicationsSkyDeep,
  Colors.applicationsSkyRight,
] as const;
const SKY_STOPS = [0, 0.45, 0.8, 1] as const;

/** Ảnh chỉ phóng theo bề rộng cột, không kéo giãn một chiều nên sóng không méo. */
function geometry(width: number) {
  const scale = width / bg.width;
  return { imageHeight: bg.height * scale, splitY: bg.splitRow * scale };
}

/**
 * Ảnh nền thuần trang trí. `aria-hidden` được View của React Native đổi sang cặp
 * `accessibilityElementsHidden` / `importantForAccessibility` trên iOS/Android,
 * còn react-native-web giữ nguyên cho DOM — cặp prop cũ thì bản web bỏ qua.
 */
const hiddenFromReader = { 'aria-hidden': true } as const;

type BackdropProps = {
  /** Bề rộng cột nội dung; ảnh phóng theo bề rộng này chứ không theo cửa sổ. */
  width: number;
  children: React.ReactNode;
};

/**
 * Nền đứng yên sau danh sách: màu trơn đúng màu hàng cắt, và nửa dưới ảnh (sóng
 * đáy) luôn sát đáy màn dù danh sách dài hay ngắn. Nửa trên có hình minh hoạ
 * nằm ở `ApplicationsTopArt` để cuộn cùng tiêu đề.
 *
 * Dùng lại cho màn khác của feature (cùng ảnh `applications-background.png`):
 * bọc vùng cuộn bằng `ApplicationsBackdrop`, rồi đặt `ApplicationsTopArt` làm con
 * đầu tiên của khối đầu nội dung cuộn — khối đó phải bắt đầu ở mép trái cột và
 * không cắt phần tràn (overflow) vì hình cao hơn khối chữ.
 */
export default function ApplicationsBackdrop({ width, children }: BackdropProps) {
  const { imageHeight, splitY } = geometry(width);

  return (
    <View style={styles.root}>
      <View style={[styles.column, { width }]}>
        <View style={[styles.bottomSlice, { height: imageHeight - splitY }]} {...hiddenFromReader}>
          <Image
            source={bg.source}
            style={[styles.image, { top: -splitY, width, height: imageHeight }]}
          />
        </View>
        {children}
      </View>
    </View>
  );
}

type TopArtProps = {
  width: number;
  /** Vùng an toàn phía trên: ảnh lùi xuống dưới thanh trạng thái cùng tiêu đề. */
  topInset: number;
};

/**
 * Nửa trên của ảnh (sóng + tập hồ sơ có dấu tích), đặt trong đầu danh sách nên
 * cuộn cùng tiêu đề và luôn nằm cạnh khối chữ như mockup. Ảnh lùi xuống theo
 * vùng an toàn để thanh trạng thái không đè lên hình minh hoạ; dải phía trên
 * được phủ bằng màu hàng đầu tiên của ảnh.
 */
export function ApplicationsTopArt({ width, topInset }: TopArtProps) {
  const { imageHeight, splitY } = geometry(width);
  const skyHeight = OVERSCROLL_COVER + topInset;

  return (
    <View
      style={[styles.topArt, { width, top: -OVERSCROLL_COVER, height: skyHeight + splitY }]}
      {...hiddenFromReader}
    >
      <LinearGradient
        colors={SKY_COLORS}
        locations={SKY_STOPS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.sky, { height: skyHeight }]}
      />
      <View style={[styles.topSlice, { top: skyHeight, height: splitY }]}>
        <Image source={bg.source} style={[styles.image, { top: 0, width, height: imageHeight }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Nền trùng màu hàng cắt: lót dưới ảnh lúc ảnh chưa nạp xong và phủ hai bên cột trên web.
  root: { flex: 1, alignItems: 'center', backgroundColor: Colors.applicationsBackdrop },
  column: { flex: 1, overflow: 'hidden' },
  // Lớp trang trí không nhận chạm; đặt trong style vì prop `pointerEvents` đã bị
  // react-native-web đánh dấu lỗi thời.
  bottomSlice: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  topArt: { position: 'absolute', left: 0, pointerEvents: 'none' },
  sky: { position: 'absolute', top: 0, left: 0, right: 0 },
  topSlice: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  image: { position: 'absolute', left: 0 },
});
