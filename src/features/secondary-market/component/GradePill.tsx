import { StyleSheet, Text, View } from 'react-native';
import type { CreditGrade } from '@/components/ui/ScoreRing';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, tabularNums } from '@/theme';
import { formatPercentValue } from '@/utils/format';

/**
 * Viên "hạng - lãi suất" như thẻ khoản vay trên Sàn: A xanh lá, B xanh dương, C/D hổ phách, E đỏ.
 * Cặp nền/chữ lấy từ `Tag` (đã đạt tương phản AA), bỏ viền như mockup.
 */
const TONE: Record<CreditGrade, { bg: string; fg: string }> = {
  A: { bg: Colors.greenBg, fg: Colors.tagGreenText },
  B: { bg: Colors.blueBg, fg: Colors.tagBlueText },
  C: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  D: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  E: { bg: Colors.redBg, fg: Colors.tagRedText },
};

export default function GradePill({ grade, annualRate }: { grade: CreditGrade | null; annualRate: number }) {
  const tone = grade ? TONE[grade] : { bg: Colors.grayBg, fg: Colors.tagGrayText };
  const rate = formatPercentValue(annualRate);
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.fg }]} maxFontSizeMultiplier={1.4}>
        {grade ? `${grade} - ${rate}` : rate}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, ...tabularNums },
});
