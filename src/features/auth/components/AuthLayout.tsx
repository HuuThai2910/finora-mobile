import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontFamily, SCREEN_PADDING, Spacing } from '@/theme';
import { LOGIN_BACKGROUND, type AuthBackground } from '../backgrounds';
import BrandMark from './BrandMark';

/** Bề rộng màn mà mockup được vẽ; bố cục đầu trang quy đổi theo tỉ lệ này. */
const DESIGN_WIDTH = 393;

/** Vị trí khối thương hiệu theo mockup 393pt (giống nhau ở mọi màn tài khoản). */
const BRAND_TOP = 72;
const BRAND_LEFT = 30;

/** Trên web và máy tính bảng, không để đầu trang phình theo bề rộng cửa sổ. */
const MAX_WIDTH = 480;

/**
 * Tiêu đề nằm cạnh hình minh hoạ chỉ phóng theo cỡ chữ hệ thống tới mức này;
 * lớn hơn nữa sẽ lấn vào hình.
 */
const MAX_FONT_SCALE = 1.2;

type Geometry = {
  width: number;
  /** Hệ số so với mockup 393pt. */
  unit: number;
  /** Số pt ứng với một pixel ảnh gốc. */
  scale: number;
  imageLeft: number;
  imageWidth: number;
  imageHeight: number;
};

function geometryFor(windowWidth: number, background: AuthBackground): Geometry {
  const width = Math.min(windowWidth, MAX_WIDTH);
  const unit = width / DESIGN_WIDTH;
  const imageWidth = width * background.zoom;
  const scale = imageWidth / background.width;
  return {
    width,
    unit,
    scale,
    imageLeft: background.shift * unit,
    imageWidth,
    imageHeight: background.height * scale,
  };
}

/**
 * Một dải ngang của ảnh nền, từ hàng `from` tới hàng `to` của ảnh gốc.
 *
 * Màn điện thoại cao hơn ảnh theo tỉ lệ, nên không trải cả ảnh (sẽ phải cắt mất
 * robot bên phải). Chỉ lấy dải trên làm đầu trang và dải đáy làm nền sóng; hai
 * đường cắt nằm trong vùng ảnh đã trắng tinh nên không lộ vết nối.
 */
function BackgroundSlice({
  background,
  geo,
  from,
  to,
}: {
  background: AuthBackground;
  geo: Geometry;
  from: number;
  to: number;
}) {
  return (
    <View style={[styles.slice, { height: (to - from) * geo.scale }]}>
      <Image
        source={background.source}
        resizeMode="cover"
        style={{
          position: 'absolute',
          left: geo.imageLeft,
          top: -from * geo.scale,
          width: geo.imageWidth,
          height: geo.imageHeight,
        }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    </View>
  );
}

type Props = {
  /** Ảnh nền của màn; mặc định là ảnh robot cầm đồng xu của màn đăng nhập. */
  background?: AuthBackground;
  /**
   * Tiêu đề và dòng phụ của màn; bỏ trống thì hiện khẩu hiệu như màn đăng nhập.
   * Nằm trong phần minh hoạ, trừ khi ảnh nền có `headingTop` (chừa chỗ trên mép
   * sóng) thì đặt dưới hình.
   */
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

/**
 * Khung chung của nhóm màn tài khoản: đầu trang minh hoạ có khối thương hiệu,
 * form ở giữa, lớp sóng làm nền ở đáy.
 */
export default function AuthLayout({
  background = LOGIN_BACKGROUND,
  title,
  subtitle,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const geo = geometryFor(windowWidth, background);
  const heroHeight = background.heroEnd * geo.scale;

  // Nội dung luôn cao ít nhất bằng khung cuộn lớn nhất từng đo được. Khi bàn
  // phím mở, khung cuộn thấp lại nhưng nội dung giữ nguyên: lớp sóng nằm yên ở
  // đáy nội dung thay vì bị đẩy lên đè vào form.
  const [viewportHeight, setViewportHeight] = useState(0);

  // Máy có tai thỏ cao thì lùi logo xuống dưới vùng an toàn.
  const brandTop = Math.max(BRAND_TOP * geo.unit, insets.top + Spacing.lg);

  // Tiêu đề đặt dưới hình thì phần nội dung được kéo lên, đè vào phần trắng
  // phía dưới-trái của đầu trang, đúng chỗ ảnh chừa trên mép sóng.
  const headingTop = title ? background.headingTop : undefined;
  const headingBelow = headingTop !== undefined;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onLayout={e => {
          const height = e.nativeEvent.layout.height;
          setViewportHeight(prev => Math.max(prev, height));
        }}
      >
        <View style={{ width: geo.width, minHeight: viewportHeight }}>
          <View style={styles.waves}>
            <BackgroundSlice
              background={background}
              geo={geo}
              from={background.wavesStart}
              to={background.height}
            />
          </View>

          <View>
            <BackgroundSlice background={background} geo={geo} from={0} to={background.heroEnd} />
            <View style={[styles.brand, { top: brandTop, left: BRAND_LEFT * geo.unit }]}>
              <BrandMark
                scale={geo.unit}
                compact={headingBelow}
                title={headingBelow ? undefined : title}
                subtitle={headingBelow ? undefined : subtitle}
              />
            </View>
          </View>

          <View
            style={[
              styles.form,
              { paddingBottom: insets.bottom + Spacing.xxxl },
              headingTop !== undefined
                ? { marginTop: headingTop * geo.unit - heroHeight, paddingTop: 0 }
                : null,
            ]}
          >
            {headingBelow ? (
              <View style={styles.heading}>
                <Text
                  style={[styles.title, { fontSize: 23 * geo.unit, lineHeight: 34 * geo.unit }]}
                  accessibilityRole="header"
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {title}
                </Text>
                {subtitle ? (
                  <Text
                    style={[
                      styles.subtitle,
                      { fontSize: 14 * geo.unit, lineHeight: 21 * geo.unit, marginTop: 4 * geo.unit },
                    ]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            ) : null}
            {children}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.card },
  scroll: { flexGrow: 1, alignItems: 'center' },
  slice: { overflow: 'hidden' },
  waves: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  brand: { position: 'absolute' },
  form: { paddingHorizontal: SCREEN_PADDING, paddingTop: Spacing.xs },
  heading: { marginBottom: Spacing.xxxl },
  title: { fontFamily: FontFamily.bold, color: Colors.authInk },
  subtitle: { fontFamily: FontFamily.regular, color: Colors.authMuted },
});
