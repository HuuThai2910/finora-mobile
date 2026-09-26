import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Spacing, lh } from '@/theme';
import { LOAN_STEP_DESIGN_WIDTH, LOAN_STEP_ILLUSTRATION, LOAN_STEP_MAX_WIDTH } from '../constant';
import LoanStepIllustration from './LoanStepIllustration';

/*
 * Cùng số đo với đầu bước 1 (`LoanProductIntro`) để hình thẻ + khiên nằm đúng
 * một chỗ khi đi từ bước 1 sang bước 2: rộng 150pt ở màn 393pt (co giãn theo
 * cột, tối đa 1,1 lần), thò ra lề phải 6pt, đáy nấp 1/5 sau thẻ bên dưới.
 */
const ILLUSTRATION_WIDTH = 150;
const OVERHANG_RIGHT = 6;
/** Khoảng từ khối chữ tới thẻ tóm tắt ngay bên dưới. */
const INTRO_CARD_GAP = Spacing.lg;
/** Phần đáy hình nấp sau thẻ tóm tắt: ảnh gốc cắt thẳng ở đáy nên phải giấu đi. */
const TUCK_RATIO = 0.2;
/** Hình không được leo cao hơn mép trên khối chữ quá mức này (tránh chạm thanh tiến độ). */
const TOP_CLEARANCE = Spacing.lg;
/** Chữ chỉ lấn vào phần trong suốt/lá ở rìa trái hộp hình, không đè lên thân hình. */
const TEXT_OVERLAP_RATIO = 0.28;

/**
 * Lời dẫn đầu bước 2/3: tiêu đề "Xem lịch trả dự kiến", một câu giải thích và
 * hình thẻ + khiên dùng chung với bước 1 (mockup vẽ tờ lịch, nhưng hai bước dùng
 * chung nền và hình để liền mạch).
 *
 * Hình neo theo đáy khối chữ: chữ phóng to làm khối cao lên thì hình đi xuống
 * theo, phần đáy cắt thẳng vẫn nằm sau thẻ tóm tắt.
 */
export default function ScheduleIntro() {
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
      {/* Vẽ hình trước để chữ và thẻ tóm tắt (vẽ sau) nằm đè lên trên. */}
      <LoanStepIllustration
        width={illustrationWidth}
        style={[styles.illustration, { bottom: -(INTRO_CARD_GAP + tuck) }]}
      />
      <View style={{ paddingRight: illustrationWidth * (1 - TEXT_OVERLAP_RATIO) - OVERHANG_RIGHT }}>
        <Text style={styles.title} accessibilityRole="header">
          Xem lịch trả dự kiến
        </Text>
        <Text style={styles.subtitle}>Dưới đây là lịch trả dự kiến cho khoản vay của bạn.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'flex-end', marginBottom: INTRO_CARD_GAP },
  illustration: { position: 'absolute', right: -OVERHANG_RIGHT },
  // Cùng cỡ với tên Product ở đầu bước 1: hai tiêu đề này trong mockup cao bằng nhau.
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.heading,
    lineHeight: lh(FontSize.heading, LineHeight.heading),
    letterSpacing: -0.4,
    color: Colors.authInk,
  },
  subtitle: {
    marginTop: Spacing.xxs,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authMuted,
  },
});
