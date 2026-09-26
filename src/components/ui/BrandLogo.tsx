import { useId } from 'react';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { decorativeSvgProps } from './decorativeSvgProps';

type Props = {
  size: number;
};

/**
 * Logo FINORA: khối lập phương (hình `box` của Lucide) với nét chuyển màu.
 *
 * Cùng hình với logo trong `BrandMark` của nhóm màn tài khoản. `BrandMark` vẫn
 * giữ bản riêng để không phải sửa các màn tài khoản đã duyệt; sửa hình logo thì
 * sửa cả hai chỗ.
 */
export default function BrandLogo({ size }: Props) {
  // Id gradient phải riêng cho từng logo: trên web các màn cũ vẫn nằm dưới màn
  // đang mở, trùng id thì trình duyệt lấy nhầm gradient của màn đang ẩn và nét
  // logo mất màu. `useId` có dấu «» và :, lọc bỏ để dùng được trong `url(#…)`.
  const gradientId = `finora-logo-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      // Hình hộp bắt đầu từ x=3 của viewBox; kéo sang trái để mép hình thẳng hàng với chữ.
      style={{ marginLeft: (-3 / 24) * size }}
      {...decorativeSvgProps}
    >
      <Defs>
        <LinearGradient id={gradientId} x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={Colors.authLogoLight} />
          <Stop offset="1" stopColor={Colors.authPrimary} />
        </LinearGradient>
      </Defs>
      <G stroke={`url(#${gradientId})`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <Path d="m3.3 7 8.7 5 8.7-5" />
        <Path d="M12 22V12" />
      </G>
    </Svg>
  );
}
