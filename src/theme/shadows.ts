import { Platform, type ViewStyle } from 'react-native';

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
