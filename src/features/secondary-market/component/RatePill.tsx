import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, tabularNums } from '@/theme';
import { formatPercentValue } from '@/utils/format';

/**
 * Viên lãi suất năm như thẻ khoản vay trên Sàn: chỉ con số ("15%"), một màu cho mọi khoản vì
 * không hiện hạng tín dụng. Cặp nền/chữ lấy từ `Tag` (đã đạt tương phản AA), bỏ viền như mockup.
 */
export default function RatePill({ annualRate }: { annualRate: number }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.text} maxFontSizeMultiplier={1.4}>
        {formatPercentValue(annualRate)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    backgroundColor: Colors.blueBg,
  },
  text: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, color: Colors.tagBlueText, ...tabularNums },
});
