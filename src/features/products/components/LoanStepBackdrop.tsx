import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { LOAN_STEP_BACKGROUND, LOAN_STEP_MAX_WIDTH } from '../constant';

/** Bề rộng dải mờ ở hai mép cột khi cửa sổ rộng hơn cột (web, máy tính bảng). */
const EDGE_FADE = 40;

type Props = {
  /** Nội dung màn (vùng cuộn, nút ghim đáy…) nằm trong cột, phía trên ảnh nền. */
  children: React.ReactNode;
};

/**
 * Nền sóng đứng yên của luồng nhập khoản vay, dùng chung cho các bước.
 *
 * Ảnh vẽ theo tỉ lệ màn điện thoại (870×1808 ≈ 0,48; máy 393×852 hay 360×780 ≈
 * 0,46) nên phủ cả cột bằng `cover`: chỉ xén vài pt ở hai mép, không kéo giãn.
 * Ảnh không cuộn theo nội dung để lớp sóng đáy luôn nằm ở đáy màn, dù nội dung
 * dài hay ngắn. Không chứa state hay dữ liệu màn nào, bước nào cũng bọc được.
 */
export default function LoanStepBackdrop({ children }: Props) {
  const { width } = useWindowDimensions();
  const columnWidth = Math.min(width, LOAN_STEP_MAX_WIDTH);
  // Cửa sổ rộng hơn cột thì sóng bị cắt thẳng ở mép cột; làm mờ dần hai mép vào
  // màu nền hai bên để không thành một đường kẻ dọc.
  const fadeEdges = width > columnWidth;

  return (
    <View style={styles.root}>
      <View style={[styles.column, { width: columnWidth }]}>
        <Image
          source={LOAN_STEP_BACKGROUND}
          resizeMode="cover"
          style={styles.image}
          aria-hidden
        />
        {fadeEdges ? (
          <>
            <LinearGradient
              colors={[Colors.productsBackdrop, Colors.productsBackdropClear]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.fade, styles.fadeLeft]}
            />
            <LinearGradient
              colors={[Colors.productsBackdropClear, Colors.productsBackdrop]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.fade, styles.fadeRight]}
            />
          </>
        ) : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Màu lót dùng chung với màn "Sản phẩm vay": mép ảnh nền này đo bằng PIL ra
  // #edf4fe–#f4f9fe, lệch màu lót không quá 4/255 nên lúc ảnh chưa nạp hay ở hai
  // bên cột trên web đều không lộ mảng lệch tông.
  root: { flex: 1, alignItems: 'center', backgroundColor: Colors.productsBackdrop },
  column: { flex: 1, overflow: 'hidden' },
  // Ảnh `require()` mang sẵn kích thước gốc (870×1808) làm width/height; chỉ neo
  // bốn cạnh thì kích thước đó vẫn thắng và ảnh nằm nguyên cỡ ở góc trái. Phải
  // đặt rõ 100% để `cover` phóng theo đúng khung cột.
  image: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  fade: { position: 'absolute', top: 0, bottom: 0, width: EDGE_FADE },
  fadeLeft: { left: 0 },
  fadeRight: { right: 0 },
});
