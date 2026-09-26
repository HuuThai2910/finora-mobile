import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/theme';
import {
  PRODUCT_LIST_DESIGN_WIDTH,
  PRODUCT_LIST_MASCOT,
  PRODUCT_LIST_MAX_WIDTH,
} from '../constant';

/** Bề rộng mascot ở màn 393pt của mockup. */
const MASCOT_WIDTH = 136;

/**
 * Khoảng thở thêm giữa đầu màn và phần minh hoạ: mockup dành khoảng một phần ba
 * chiều cao màn cho đầu màn cộng minh hoạ, thẻ đầu tiên bắt đầu ngay dưới mascot.
 */
const HERO_TOP_GAP = 8;

/**
 * Tiêu đề nằm cạnh mascot chỉ phóng theo cỡ chữ hệ thống tới mức này; lớn hơn
 * nữa thì dòng chữ xanh vỡ thành nhiều dòng và đẩy thẻ đầu tiên xuống quá xa.
 */
const MAX_FONT_SCALE = 1.2;

/** Mockup lặp lại tên một sản phẩm ở đây; màn danh sách dùng câu chung cho cả danh mục. */
const HEADLINE_LEAD = 'Chọn khoản vay';
const HEADLINE_ACCENT = 'phù hợp với bạn';
const SUBTITLE = 'Giải pháp tài chính linh hoạt\ncho mọi nhu cầu của bạn';

/**
 * Đầu trang của màn "Sản phẩm vay": lời mời bên trái, robot cầm đồng xu bên
 * phải, đặt thẳng trên lớp sóng. Cỡ chữ và mascot co theo bề rộng màn (như
 * `AuthLayout`) để dòng chữ xanh vẫn nằm trọn một dòng cạnh mascot ở máy 360pt.
 */
export default function ProductListHero() {
  const { width } = useWindowDimensions();
  // Chỉ phóng nhẹ trên màn rộng; cột nội dung đã dừng ở PRODUCT_LIST_MAX_WIDTH.
  const unit = Math.min(Math.min(width, PRODUCT_LIST_MAX_WIDTH) / PRODUCT_LIST_DESIGN_WIDTH, 1.1);
  const mascotWidth = MASCOT_WIDTH * unit;
  const mascotHeight = (mascotWidth * PRODUCT_LIST_MASCOT.height) / PRODUCT_LIST_MASCOT.width;

  return (
    <View style={[styles.row, { marginTop: HERO_TOP_GAP * unit }]}>
      <View style={styles.copy}>
        <View
          accessible
          accessibilityRole="header"
          accessibilityLabel={`${HEADLINE_LEAD} ${HEADLINE_ACCENT}`}
        >
          <Text
            style={[styles.lead, { fontSize: 20 * unit, lineHeight: 28 * unit }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {HEADLINE_LEAD}
          </Text>
          <Text
            style={[styles.accent, { fontSize: 26 * unit, lineHeight: 37 * unit }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {HEADLINE_ACCENT}
          </Text>
        </View>
        <Text
          style={[styles.subtitle, { fontSize: 13 * unit, lineHeight: 20 * unit, marginTop: 6 * unit }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {SUBTITLE}
        </Text>
      </View>

      <Image
        source={PRODUCT_LIST_MASCOT.source}
        style={{ width: mascotWidth, height: mascotHeight }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  copy: { flex: 1, minWidth: 0 },
  lead: { fontFamily: FontFamily.bold, color: Colors.authInk },
  accent: { fontFamily: FontFamily.bold, color: Colors.authPrimary },
  subtitle: { fontFamily: FontFamily.regular, color: Colors.authMuted },
});
