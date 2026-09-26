import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { PRODUCT_LIST_BACKGROUND, PRODUCT_LIST_MAX_WIDTH } from '../constant';

/** Bề rộng dải mờ ở hai mép cột khi cửa sổ rộng hơn cột (web, máy tính bảng). */
const EDGE_FADE = 40;

/**
 * Nền sóng của màn "Sản phẩm vay", đứng yên sau vùng cuộn.
 *
 * Ảnh được vẽ sẵn theo tỉ lệ màn điện thoại (857×1836 ≈ 0,47, máy 393×852 ≈ 0,46)
 * nên phủ nguyên cột bằng `cover`: chỉ xén đều vài pt ở hai mép, không kéo giãn
 * và không có vết nối giữa các dải. Để ảnh đứng yên thay vì cuộn theo nội dung
 * thì lớp sóng đáy luôn nằm ở đáy màn, dù danh sách dài hay ngắn; kéo làm mới
 * cũng không để lộ khoảng trống phía trên.
 */
export default function ProductListBackdrop({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const columnWidth = Math.min(width, PRODUCT_LIST_MAX_WIDTH);
  // Cửa sổ rộng hơn cột thì sóng bị cắt thẳng ở mép cột; làm mờ dần hai mép vào
  // màu nền hai bên để không thành một đường kẻ dọc.
  const fadeEdges = width > columnWidth;

  return (
    <View style={styles.root}>
      <View style={[styles.column, { width: columnWidth }]}>
        <Image
          source={PRODUCT_LIST_BACKGROUND}
          resizeMode="cover"
          style={styles.image}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
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
  root: { flex: 1, alignItems: 'center', backgroundColor: Colors.productsBackdrop },
  column: { flex: 1, overflow: 'hidden' },
  // Ảnh `require()` tự mang kích thước gốc (857×1836) làm width/height; chỉ neo bốn
  // cạnh thì kích thước đó vẫn thắng và ảnh nằm nguyên cỡ ở góc trái. Phải đặt rõ
  // 100% để `cover` phóng theo đúng khung cột.
  image: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  fade: { position: 'absolute', top: 0, bottom: 0, width: EDGE_FADE },
  fadeLeft: { left: 0 },
  fadeRight: { right: 0 },
});
