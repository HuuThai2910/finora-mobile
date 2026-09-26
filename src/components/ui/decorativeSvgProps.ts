import { Platform } from 'react-native';

/**
 * Props ẩn một hình SVG trang trí khỏi trình đọc màn hình.
 *
 * Trên web, react-native-svg đẩy nguyên prop xuống thẻ `<svg>` của DOM, nên prop
 * riêng của React Native (`accessibilityElementsHidden`, `importantForAccessibility`)
 * làm React báo "does not recognize the prop"; web dùng `aria-hidden` chuẩn HTML.
 * iOS/Android giữ nguyên hai prop cũ để không đổi hành vi đã chạy ổn trên máy.
 */
export const decorativeSvgProps =
  Platform.OS === 'web'
    ? ({ 'aria-hidden': true } as const)
    : ({ accessibilityElementsHidden: true, importantForAccessibility: 'no' } as const);
