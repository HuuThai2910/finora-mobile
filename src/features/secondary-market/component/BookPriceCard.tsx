import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, tabularNums } from '@/theme';
import type { BookSnapshot } from '@/types/orderBook';
import { formatAnnualRateShort, formatTime } from '@/utils/format';
import { BOOK_MASCOT } from '../constant';
import { formatBookPrice, formatDenomination } from '../format';

/** Robot toàn thân 480×510, đứng ở góc phải thẻ, chân dừng trên hàng chip. */
const MASCOT_HEIGHT = 116;
const MASCOT_WIDTH = Math.round((MASCOT_HEIGHT * 480) / 510);

/**
 * Thẻ đầu sổ lệnh theo mockup 02/10: nền xanh đậm dần như thẻ ví, robot cầm đồng xu ở góc phải,
 * con số lớn là giá khớp gần nhất, dưới cùng là ba chip có biểu tượng cho hạng, lãi suất và kỳ hạn
 * của khoản vay gốc. Mascot vẽ trước nên nằm dưới chữ.
 */
export default function BookPriceCard({ book }: { book: BookSnapshot }) {
  // Máy hẹp (360pt): chip nhỏ lại một chút để ba chip vẫn nằm trên một hàng.
  const compact = useWindowDimensions().width < 380;
  const last = book.lastTrade;
  const chips: { icon: IconName; label: string }[] = [
    ...(book.grade ? [{ icon: 'shieldCheck' as const, label: `Hạng ${book.grade}` }] : []),
    { icon: 'chartNoAxesColumn', label: formatAnnualRateShort(book.annualRate) },
    { icon: 'clock', label: `${book.termMonths} tháng` },
  ];

  return (
    <LinearGradient
      colors={[Colors.walletFrom, Colors.walletVia, Colors.walletTo]}
      // Tối ở góc dưới-trái nơi có chữ, sáng dần lên góc trên-phải nơi chỉ có mascot.
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.card}
    >
      <Image
        source={BOOK_MASCOT}
        resizeMode="contain"
        style={styles.mascot}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <Text style={styles.label} maxFontSizeMultiplier={1.4}>
        Giá khớp gần nhất
      </Text>
      {/* Cùng chiều cao cho cả hai trường hợp để hàng chip luôn nằm dưới chân robot. */}
      <View style={styles.valueBox}>
        {last == null ? (
          <Text style={styles.empty} maxFontSizeMultiplier={1.3}>
            Chưa có giao dịch
          </Text>
        ) : (
          <View style={styles.valueRow} accessible accessibilityLabel={`Giá khớp gần nhất ${formatBookPrice(last)} dư nợ gốc`}>
            <Text style={styles.value} maxFontSizeMultiplier={1.3}>{formatBookPrice(last)}</Text>
            <Text style={styles.unit} maxFontSizeMultiplier={1.4}>dư nợ</Text>
          </View>
        )}
      </View>
      <Text style={styles.sub} maxFontSizeMultiplier={1.4}>
        {book.lastTradeAt ? `Khớp lúc ${formatTime(book.lastTradeAt)}, ` : ''}
        {`mỗi Note ${formatDenomination(book.noteDenomination)}`}
      </Text>

      <View style={styles.chips}>
        {chips.map(chip => (
          <View key={chip.label} style={[styles.chip, compact && styles.chipCompact]}>
            <Icon name={chip.icon} size={compact ? 13 : 14} color={Colors.onDark} strokeWidth={2.4} />
            <Text style={[styles.chipText, compact && styles.chipTextCompact]} maxFontSizeMultiplier={1.3}>{chip.label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 18, paddingBottom: 16, overflow: 'hidden' },
  mascot: { position: 'absolute', right: 8, top: 4, width: MASCOT_WIDTH, height: MASCOT_HEIGHT },
  label: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.onDarkMuted },
  valueBox: { minHeight: 44, justifyContent: 'center', marginRight: MASCOT_WIDTH - 40 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  value: { fontFamily: FontFamily.extrabold, fontSize: 32, lineHeight: 42, letterSpacing: -0.6, color: Colors.onDark, ...tabularNums },
  unit: { fontFamily: FontFamily.medium, fontSize: 14, lineHeight: 20, color: Colors.onDarkMuted },
  empty: { fontFamily: FontFamily.extrabold, fontSize: 22, lineHeight: 30, letterSpacing: -0.3, color: Colors.onDark },
  // Chừa bên phải cho mascot, để dòng phụ dài xuống dòng chứ không đè lên robot.
  sub: { marginRight: MASCOT_WIDTH, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.onDarkMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.bookChipBorder,
    backgroundColor: Colors.walletChip,
  },
  chipCompact: { paddingHorizontal: 8, gap: 4 },
  chipTextCompact: { fontSize: 12, lineHeight: 17 },
  chipText: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18, color: Colors.onDark, ...tabularNums },
});
