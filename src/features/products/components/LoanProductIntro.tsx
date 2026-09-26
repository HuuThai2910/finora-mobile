import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Radius, Spacing, lh } from '@/theme';
import { LOAN_STEP_DESIGN_WIDTH, LOAN_STEP_ILLUSTRATION, LOAN_STEP_MAX_WIDTH } from '../constant';
import LoanStepIllustration from './LoanStepIllustration';

type Props = {
  name: string;
  /** Nhãn cách trả của Product (trường thật `repaymentMethod`), hiện trong viên nhãn xanh. */
  repaymentLabel: string;
};

/** Số đo ở màn 393pt của mockup; hình co giãn theo cột nhưng không phóng quá 1,1 lần. */
const ILLUSTRATION_WIDTH = 144;
/** Khoảng từ khối chữ tới thẻ điều khoản ngay bên dưới. */
const INTRO_CARD_GAP = Spacing.md;
/**
 * Phần đáy hình nấp sau thẻ điều khoản: ảnh gốc cắt thẳng ở đáy nên phải giấu đi.
 * Mép phải hình trùng mép phải thẻ (mockup cho lá thò ra ngoài, nhưng ảnh này có
 * lá bị cắt thẳng ở góc dưới-phải); 12% chiều cao đủ để góc bo 16pt của thẻ vẫn
 * che hết đường cắt.
 */
const TUCK_RATIO = 0.12;
/** Hình không được leo cao hơn mép trên khối chữ quá mức này (tránh chạm thanh tiến độ). */
const TOP_CLEARANCE = Spacing.lg;
/**
 * Chữ được lấn vào phần trái của hộp hình: đo bằng PIL, 40% hàng trên cùng của
 * ảnh trong suốt tới 30,7% bề rộng (lá chỉ mọc ở nửa dưới), nên lấn 30% vẫn
 * không đè lên hình mà tên "Vay tiêu dùng tiêu chuẩn" vừa một dòng ở máy 393pt.
 */
const TEXT_OVERLAP_RATIO = 0.3;

/**
 * Đầu nội dung bước 1: nhãn "SẢN PHẨM VAY", tên Product (xuống dòng nếu dài) và
 * viên nhãn cách trả; hình thẻ + khiên ở góc phải, đáy nấp sau thẻ điều khoản.
 *
 * Mockup ghi "Khoản vay minh bạch" trong viên nhãn — đó là lời quảng cáo, không
 * có trường dữ liệu nào chứng minh, nên thay bằng cách trả thật của Product.
 * Hình neo theo đáy khối chữ để dù tên dài mấy dòng thì đáy hình vẫn nấp sau thẻ.
 */
export default function LoanProductIntro({ name, repaymentLabel }: Props) {
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
      <LoanStepIllustration
        width={illustrationWidth}
        style={[styles.illustration, { bottom: -(INTRO_CARD_GAP + tuck) }]}
      />

      <View
        style={{
          paddingRight: illustrationWidth * (1 - TEXT_OVERLAP_RATIO),
        }}
      >
        <Text style={styles.eyebrow}>SẢN PHẨM VAY</Text>
        <Text style={styles.name} accessibilityRole="header">
          {name}
        </Text>
        <View style={styles.pill} accessible accessibilityLabel={`Cách trả: ${repaymentLabel}`}>
          <View style={styles.dot} />
          <Text style={styles.pillText}>{repaymentLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: 'flex-end', marginBottom: INTRO_CARD_GAP },
  illustration: { position: 'absolute', right: 0 },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.5),
    letterSpacing: 0.6,
    color: Colors.authMuted,
  },
  name: {
    marginTop: Spacing.xxs,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.heading,
    lineHeight: lh(FontSize.heading, LineHeight.heading),
    letterSpacing: -0.4,
    color: Colors.authInk,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.tintGreen,
  },
  dot: { width: 6, height: 6, borderRadius: Radius.pill, backgroundColor: Colors.green },
  pillText: {
    flexShrink: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.5),
    color: Colors.tagGreenText,
  },
});
