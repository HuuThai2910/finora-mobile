import { Platform, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

/**
 * Ba bậc đổ bóng quy đổi từ `--shadow-sm` / `--shadow` / `--shadow-lg` của mockup.
 * iOS dùng shadow*, Android dùng elevation — giữ một thang thống nhất, không đặt
 * giá trị bóng tùy hứng ở từng màn.
 */
const make = (
  opacity: number,
  radius: number,
  offsetY: number,
  elevation: number,
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0f1b30',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: { elevation },
    default: {},
  })!;

export const Shadow = {
  sm: make(0.05, 3, 1, 1),
  md: make(0.08, 12, 6, 4),
  lg: make(0.16, 24, 12, 10),
} as const;

/** '#1a4fb8' + 0.1 → 'rgba(26,79,184,0.1)', vì box-shadow của web cần màu kèm độ trong. */
const rgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

/**
 * Bóng của bộ mockup mới (từ trang chủ 26/09/2026): ngả xanh theo nền sóng
 * thay vì xám. Có thêm box-shadow cho web vì bản web là nơi xem thử thường
 * xuyên, thiếu bóng thì thẻ trắng chìm vào nền và trông phẳng hơn máy thật.
 *
 * Android chỉ đổ bóng đẹp cho khối nền đặc; khối nền trong suốt (kính mờ) mà
 * có elevation thì bóng lộ ra bên trong thẻ, nên bậc `glass` không có elevation.
 */
const soft = (opacity: number, radius: number, offsetY: number, elevation: number): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: Colors.cardShadow,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: elevation > 0 ? { elevation, shadowColor: Colors.cardShadow } : {},
    default: { boxShadow: `0px ${offsetY}px ${radius}px ${rgba(Colors.cardShadow, opacity)}` },
  });

export const SoftShadow = {
  /** Thẻ kính mờ trên nền sóng. */
  glass: soft(0.1, 16, 6, 0),
  /** Thẻ trắng nền đặc. */
  card: soft(0.07, 18, 6, 2),
  /** Khối nổi hẳn lên, như ô minh hoạ trên thẻ giới thiệu. */
  raised: soft(0.28, 10, 6, 6),
} as const;
