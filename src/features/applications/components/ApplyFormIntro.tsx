import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Spacing, lh } from '@/theme';
import {
  LOAN_STEP_DESIGN_WIDTH,
  LOAN_STEP_ILLUSTRATION,
  LOAN_STEP_MAX_WIDTH,
  LoanStepIllustration,
} from '@/features/products';

/*
 * Cùng số đo với lời dẫn bước 2 (`ScheduleIntro`) để hình thẻ + khiên nằm đúng
 * một chỗ khi đi từ bước 2 sang bước 3: rộng 150pt ở màn 393pt (co giãn theo
 * cột, tối đa 1,1 lần), thò ra lề phải 6pt, đáy nấp 1/5 sau thẻ bên dưới.
 */
const ILLUSTRATION_WIDTH = 150;
const OVERHANG_RIGHT = 6;
/** Khoảng từ khối chữ tới thẻ khoản vay đã chọn ngay bên dưới. */
const INTRO_CARD_GAP = Spacing.lg;
/** Phần đáy hình nấp sau thẻ khoản vay: ảnh gốc cắt thẳng ở đáy nên phải giấu đi. */
const TUCK_RATIO = 0.2;
/** Hình không được leo cao hơn mép trên khối chữ quá mức này (tránh chạm thanh tiến độ). */
const TOP_CLEARANCE = Spacing.lg;
/** Chữ chỉ lấn vào phần trong suốt/lá ở rìa trái hộp hình, không đè lên thân hình. */
const TEXT_OVERLAP_RATIO = 0.28;

/**
 * Lời dẫn đầu bước 3/3: nhãn "THÔNG TIN NGƯỜI VAY", tiêu đề "Khoản vay đã chọn"
 * và câu nhắc kiểm tra lại. Hình thẻ + khiên dùng chung với bước 1–2 (mockup vẽ
 * tờ hồ sơ nhưng ba bước dùng chung nền và hình để liền mạch).
 *
 * Hình neo theo đáy khối chữ: chữ phóng to làm khối cao lên thì hình đi xuống
 * theo, phần đáy cắt thẳng vẫn nằm sau thẻ khoản vay.
 */
export default function ApplyFormIntro() {
  const { width } = useWindowDimensions();
  const unit = Math.min(Math.min(width, LOAN_STEP_MAX_WIDTH) / LOAN_STEP_DESIGN_WIDTH, 1.1);
  const illustrationWidth = ILLUSTRATION_WIDTH * unit;
  const illustrationHeight =
    (illustrationWidth * LOAN_STEP_ILLUSTRATION.height) / LOAN_STEP_ILLUSTRATION.width;
  const tuck = illustrationHeight * TUCK_RATIO;

  return (
    <View
      style={[
        styles.wrap,
        { minHeight: illustrationHeight - tuck - INTRO_CARD_GAP + TOP_CLEARANCE },
      ]}
    >
      {/* Vẽ hình trước để chữ và thẻ khoản vay (vẽ sau) nằm đè lên trên. */}
      <LoanStepIllustration
        width={illustrationWidth}
        style={[styles.illustration, { bottom: -(INTRO_CARD_GAP + tuck) }]}
      />
      <View style={{ paddingRight: illustrationWidth * (1 - TEXT_OVERLAP_RATIO) - OVERHANG_RIGHT }}>
        <Text style={styles.eyebrow}>THÔNG TIN NGƯỜI VAY</Text>
        <Text style={styles.title} accessibilityRole="header">
          Khoản vay đã chọn
        </Text>
        <Text style={styles.subtitle}>Vui lòng kiểm tra lại thông tin trước khi nộp hồ sơ.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'flex-end', marginBottom: INTRO_CARD_GAP },
  illustration: { position: 'absolute', right: -OVERHANG_RIGHT },
  // Nhãn trên và tiêu đề cùng kiểu với đầu bước 1 ("SẢN PHẨM VAY" + tên Product).
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.5),
    letterSpacing: 0.6,
    color: Colors.authMuted,
  },
  title: {
    marginTop: Spacing.xxs,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.heading,
    lineHeight: lh(FontSize.heading, LineHeight.heading),
    letterSpacing: -0.4,
    color: Colors.authInk,
  },
  // Cùng cỡ câu dẫn của bước 2.
  subtitle: {
    marginTop: Spacing.xxs,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authMuted,
  },
});
