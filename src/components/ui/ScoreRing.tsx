import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/theme';

/**
 * Bản thiết kế chỉ vẽ bốn hạng A–D, nhưng mô hình trong `finora-ai` trả năm
 * hạng (`credit_grade: A|B|C|D|E`). Hạng E dùng chung tông đỏ với D để không
 * phát minh thêm màu ngoài bảng màu gốc.
 */
export type CreditGrade = 'A' | 'B' | 'C' | 'D' | 'E';

const GRADES: Record<CreditGrade, { bg: string; fg: string; border: string; risk: string }> = {
  A: { bg: Colors.scoreABg, fg: Colors.tagGreenText, border: Colors.scoreA, risk: 'Rủi ro cực thấp' },
  B: { bg: Colors.scoreBBg, fg: Colors.tagBlueText, border: Colors.scoreB, risk: 'Rủi ro trung bình' },
  C: { bg: Colors.scoreCBg, fg: Colors.tagAmberText, border: Colors.scoreC, risk: 'Rủi ro cao' },
  D: { bg: Colors.scoreDBg, fg: Colors.tagRedText, border: Colors.scoreD, risk: 'Rủi ro rất cao' },
  E: { bg: Colors.scoreDBg, fg: Colors.tagRedText, border: Colors.red, risk: 'Rủi ro đặc biệt cao' },
};

type Props = {
  grade: CreditGrade;
  /** Đường kính. Mockup dùng 54px cho cỡ chuẩn, 46 và 74 cho hai chỗ đặc biệt. */
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * `.score-ring` + `.score-A..D` của mockup.
 * Hạng tín dụng không chỉ phân biệt bằng màu — chữ cái A/B/C/D luôn hiển thị,
 * và mô tả rủi ro được đọc lên cho trình đọc màn hình.
 */
export default function ScoreRing({ grade, size = 81, style }: Props) {
  const g = GRADES[grade];

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Hạng tín dụng ${grade} — ${g.risk}`}
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: g.bg,
          borderColor: g.border,
          borderWidth: Math.max(3, Math.round(size * 0.056)),
        },
        style,
      ]}
    >
      <Text style={[styles.letter, { color: g.fg, fontSize: Math.round(size * 0.37) }]}>
        {grade}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: FontFamily.extrabold },
});
