import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, tabularNums } from '@/theme';
import type { MarketLoan } from '@/types/invest';
import { formatAnnualRateShort, formatDong } from '@/utils/format';
import { LOAN_HERO_MASCOT, MARKET_MAX_WIDTH, MARKET_PADDING } from '../constant';

/** Robot toàn thân 480×510, đứng ở góc phải thẻ, chân dừng trên hàng chip. */
const MASCOT_HEIGHT = 116;
const MASCOT_WIDTH = Math.round((MASCOT_HEIGHT * 480) / 510);
/** Bề rộng thẻ của màn 393pt (trừ lề hai bên) — mốc để co cỡ số tiền. */
const DESIGN_WIDTH = 361;

/**
 * Thẻ đầu màn chi tiết khoản vay, cùng dáng thẻ giá của sổ lệnh: nền xanh đậm dần như thẻ ví,
 * robot cầm đồng xu ở góc phải, con số lớn là số tiền khoản vay cần gọi, dòng phụ là mục đích và
 * khu vực, dưới cùng là ba chip hạng, lãi suất, kỳ hạn. Mascot vẽ trước nên nằm dưới chữ.
 */
export default function LoanHeroCard({ loan }: { loan: MarketLoan }) {
  const windowWidth = useWindowDimensions().width;
  // Ba chip phải nằm một hàng kể cả lãi suất lẻ ("10,5%/năm", tối đa 4 chữ số lẻ); máy hẹp
  // (360pt) nhỏ thêm một bậc.
  const compact = windowWidth < 380;
  // Số tiền nằm cạnh robot nên cỡ chữ co theo bề rộng thẻ, chặn hai đầu cho máy tính bảng.
  const cardWidth = Math.min(windowWidth, MARKET_MAX_WIDTH) - MARKET_PADDING * 2;
  const unit = Math.min(1.1, Math.max(0.82, cardWidth / DESIGN_WIDTH));
  const amount = formatDong(loan.amount);
  const chips: { icon: IconName; label: string }[] = [
    { icon: 'shieldCheck', label: `Hạng ${loan.grade}` },
    { icon: 'chartNoAxesColumn', label: formatAnnualRateShort(loan.annualRate) },
    { icon: 'clock', label: `${loan.termMonths} tháng` },
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
        source={LOAN_HERO_MASCOT}
        resizeMode="contain"
        style={styles.mascot}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <Text style={styles.label} maxFontSizeMultiplier={1.4}>
        Số tiền cần gọi vốn
      </Text>
      <Text
        style={[styles.value, { fontSize: Math.round(30 * unit), lineHeight: Math.round(40 * unit) }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        accessibilityLabel={`Số tiền cần gọi vốn ${amount}`}
      >
        {amount}
      </Text>
      <Text style={styles.sub} maxFontSizeMultiplier={1.4}>
        {[loan.purpose, loan.region].filter(Boolean).join(', ')}
      </Text>

      <View style={styles.chips}>
        {chips.map(chip => (
          <View key={chip.icon} style={[styles.chip, compact && styles.chipCompact]}>
            <Icon name={chip.icon} size={compact ? 12 : 13} color={Colors.onDark} strokeWidth={2.4} />
            <Text style={[styles.chipText, compact && styles.chipTextCompact]} maxFontSizeMultiplier={1.3}>
              {chip.label}
            </Text>
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
  // Chừa bên phải cho robot: con số dài thì co lại (máy thật) hoặc cắt gọn (web), không đè lên robot.
  value: {
    marginTop: 2,
    marginRight: MASCOT_WIDTH - 36,
    fontFamily: FontFamily.extrabold,
    letterSpacing: -0.5,
    color: Colors.onDark,
    ...tabularNums,
  },
  sub: {
    marginTop: 2,
    marginRight: MASCOT_WIDTH,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.onDarkMuted,
  },
  // Vẫn cho xuống dòng khi người dùng phóng chữ hệ thống rất lớn: thà hai hàng còn hơn cắt chữ.
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 18 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.bookChipBorder,
    backgroundColor: Colors.walletChip,
  },
  chipCompact: { paddingHorizontal: 7, gap: 3 },
  chipText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, color: Colors.onDark, ...tabularNums },
  chipTextCompact: { fontSize: 11.5, lineHeight: 16 },
});
