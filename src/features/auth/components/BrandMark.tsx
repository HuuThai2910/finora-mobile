import { useId } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/theme';
import { decorativeSvgProps } from '@/components/ui';
import { APP_NAME, APP_TAGLINE } from '../constants';

type Props = {
  /**
   * Tỉ lệ so với bề rộng 393pt của mockup. Khối này nằm đè lên ảnh minh hoạ nên
   * phải co giãn cùng ảnh, nếu không chữ sẽ lấn vào đồng xu trên máy màn hẹp.
   */
  scale: number;
  /**
   * Có tiêu đề (màn đăng ký…) thì tên app thu nhỏ, nhường chỗ cho tiêu đề và
   * dòng phụ; không có thì hiện tên app cỡ lớn kèm khẩu hiệu như màn đăng nhập.
   */
  title?: string;
  subtitle?: string;
  /** Chỉ logo và tên app cỡ nhỏ, khi tiêu đề màn nằm dưới phần minh hoạ (màn quên mật khẩu). */
  compact?: boolean;
};

/**
 * Chữ đầu trang chỉ phóng theo cỡ chữ hệ thống tới mức này; lớn hơn nữa sẽ tràn
 * sang phần hình minh hoạ bên phải.
 */
const MAX_FONT_SCALE = 1.2;

/** Khối thương hiệu đầu các màn tài khoản: logo khối lập phương, tên app, rồi khẩu hiệu hoặc tiêu đề màn. */
export default function BrandMark({ scale: u, title, subtitle, compact = false }: Props) {
  if (!title && !compact) {
    return (
      <View>
        <CubeLogo size={42 * u} />
        <Text
          style={[styles.name, { fontSize: 33 * u, lineHeight: 40 * u, marginTop: 4 * u }]}
          accessibilityRole="header"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {APP_NAME}
        </Text>
        <Text
          style={[
            styles.muted,
            { fontSize: 14 * u, lineHeight: 21 * u, marginTop: 6 * u, maxWidth: 142 * u },
          ]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {APP_TAGLINE}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <CubeLogo size={42 * u} />
      <Text
        style={[styles.name, { fontSize: 23.5 * u, lineHeight: 30 * u, marginTop: 2 * u }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {APP_NAME}
      </Text>
      {title ? (
        <Text
          style={[styles.title, { fontSize: 23 * u, lineHeight: 34 * u, marginTop: 8 * u }]}
          accessibilityRole="header"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          style={[
            styles.muted,
            { fontSize: 13.5 * u, lineHeight: 20 * u, marginTop: 2 * u, maxWidth: 165 * u },
          ]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Logo khối lập phương (hình `box` của Lucide) với nét chuyển màu như mockup.
 * Gradient đặt theo toạ độ viewBox để cả ba nét dùng chung một dải màu liền.
 */
function CubeLogo({ size }: { size: number }) {
  // Id gradient phải riêng cho từng logo: trên web, màn đăng nhập vẫn nằm dưới
  // màn đăng ký, trùng id thì trình duyệt lấy gradient của màn đang ẩn và nét
  // logo mất màu. `useId` có dấu «» và :, lọc bỏ để dùng được trong `url(#…)`.
  const gradientId = `finora-cube-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

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
        <LinearGradient
          id={gradientId}
          x1="3"
          y1="2"
          x2="21"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={Colors.authLogoLight} />
          <Stop offset="1" stopColor={Colors.authPrimary} />
        </LinearGradient>
      </Defs>
      <G
        stroke={`url(#${gradientId})`}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <Path d="m3.3 7 8.7 5 8.7-5" />
        <Path d="M12 22V12" />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  name: { fontFamily: FontFamily.extrabold, color: Colors.authInk },
  title: { fontFamily: FontFamily.bold, color: Colors.authInk },
  muted: { fontFamily: FontFamily.regular, color: Colors.authMuted },
});
