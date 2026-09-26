import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Radius } from '@/theme';
import { LOAN_STEP_ILLUSTRATION } from '../constant';

type Props = {
  /** Bề rộng hình (pt); chiều cao tự suy theo tỉ lệ ảnh 600×315. */
  width: number;
  /** Vị trí do màn quyết định, thường là `position: 'absolute'` ở góc trên-phải. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Quầng sáng tròn sau hình, đo từ mockup theo bề rộng hình: đường kính ≈ 1,23
 * lần, tâm lệch phải (0,73 bề rộng) và thấp xuống (0,44 bề rộng) so với góc
 * trên-trái hình, nên phần lớn quầng nằm ngoài hộp của hình.
 */
const GLOW = { diameter: 1.23, centerX: 0.73, centerY: 0.44 } as const;

/**
 * Hình thẻ + khiên + lá ở đầu các bước nhập khoản vay, kèm quầng sáng nhạt phía
 * sau như mockup. Thuần trang trí nên ẩn với trình đọc màn hình.
 *
 * Đáy ảnh cắt thẳng (ảnh gốc vẽ để nấp sau thẻ), nên màn đặt hình sao cho thẻ
 * trắng kế tiếp đè lên phần đáy (bước 1 giấu 12% chiều cao, mép phải hình không
 * vượt mép phải thẻ). Quầng tràn ra ngoài hộp của hình; cột nội dung cắt phần
 * tràn ở mép màn giống mockup.
 */
export default function LoanStepIllustration({ width, style }: Props) {
  const height = (width * LOAN_STEP_ILLUSTRATION.height) / LOAN_STEP_ILLUSTRATION.width;
  const glowSize = width * GLOW.diameter;

  return (
    <View
      style={[styles.root, { width, height }, style]}
      aria-hidden
    >
      <LinearGradient
        colors={[Colors.loanGlow, Colors.loanGlowClear]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[
          styles.glow,
          {
            width: glowSize,
            height: glowSize,
            left: width * GLOW.centerX - glowSize / 2,
            top: width * GLOW.centerY - glowSize / 2,
          },
        ]}
      />
      <Image source={LOAN_STEP_ILLUSTRATION.source} style={{ width, height }} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  // Hình thường nằm đè lên chữ đầu trang; không nhận chạm để không chặn thao tác bên dưới.
  root: { pointerEvents: 'none' },
  glow: { position: 'absolute', borderRadius: Radius.pill },
});
