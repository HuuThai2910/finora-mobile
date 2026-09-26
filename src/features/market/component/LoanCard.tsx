import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { MarketLoan } from '@/types/invest';
import { formatDong, formatPercentValue } from '@/utils/format';
import { GRADE_TONE } from '../constant';

/** Cùng cặp nền/chữ với `Tag` (đã đạt tương phản AA), bỏ viền như viên nhãn của mockup. */
const TONES = {
  green: { bg: Colors.greenBg, fg: Colors.tagGreenText },
  red: { bg: Colors.redBg, fg: Colors.tagRedText },
  amber: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  blue: { bg: Colors.blueBg, fg: Colors.tagBlueText },
  violet: { bg: Colors.violetBg, fg: Colors.tagVioletText },
  gray: { bg: Colors.grayBg, fg: Colors.tagGrayText },
} as const;

/** Ô biểu tượng tròn theo mockup; khung giả lúc tải dùng cùng số đo. */
export const LOAN_TILE = 44;
/** Thanh tiến độ dày như mockup (thanh 4pt cũ khó đọc khi lướt nhanh). */
const BAR_HEIGHT = 8;

/**
 * Thẻ một khoản vay trên sàn (mockup 26/09/2026): mã, số tiền, hạng kèm lãi suất,
 * thanh tiến độ gọi vốn, kỳ hạn và phần trăm đã gọi. Cả thẻ là một nút mở chi
 * tiết khoản vay, nên nhãn đọc gói đủ các con số trên thẻ.
 */
export default function LoanCard({ loan, onPress }: { loan: MarketLoan; onPress: () => void }) {
  const tone = TONES[GRADE_TONE[loan.grade]];
  const rate = formatPercentValue(loan.annualRate);
  const amount = formatDong(loan.amount);
  // Backend có thể trả >100% khi gọi dư trong lúc chốt sổ; thanh không được tràn khung.
  const funded = Math.min(Math.max(loan.fundedPercent, 0), 100);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Khoản vay ${loan.id}, ${amount}, hạng ${loan.grade}, lãi suất ${rate} một năm, kỳ hạn ${loan.termMonths} tháng, đã gọi ${loan.fundedPercent}% vốn`}
      accessibilityHint="Mở chi tiết khoản vay"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.tile}>
        <Icon name="fileText" size={22} color={Colors.authPrimary} />
      </View>

      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.titleBlock}>
            <Text style={styles.id} maxFontSizeMultiplier={1.4}>
              {loan.id}
            </Text>
            <Text style={styles.amount} maxFontSizeMultiplier={1.4}>
              {amount}
            </Text>
          </View>
          <View style={styles.side}>
            <View style={[styles.pill, { backgroundColor: tone.bg }]}>
              <Text style={[styles.pillText, { color: tone.fg }]} maxFontSizeMultiplier={1.4}>
                {`${loan.grade} - ${rate}`}
              </Text>
            </View>
            <Icon name="chevronRight" size={20} color={Colors.chevronMuted} />
          </View>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${funded}%` }]} />
        </View>

        <View style={styles.foot}>
          <View style={styles.term}>
            <Icon name="clock" size={15} color={Colors.authMuted} />
            <Text style={styles.meta} maxFontSizeMultiplier={1.4}>{`${loan.termMonths} tháng`}</Text>
          </View>
          <Text style={styles.meta} maxFontSizeMultiplier={1.4}>{`${loan.fundedPercent}% vốn`}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.72 },
  tile: {
    width: LOAN_TILE,
    height: LOAN_TILE,
    borderRadius: LOAN_TILE / 2,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  titleBlock: { flexShrink: 1 },
  id: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  amount: {
    marginTop: 2,
    fontFamily: FontFamily.bold,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.authInk,
    ...tabularNums,
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, ...tabularNums },
  track: {
    height: BAR_HEIGHT,
    marginTop: Spacing.md,
    marginRight: 4,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: Colors.authBorder,
    overflow: 'hidden',
  },
  fill: { height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, backgroundColor: Colors.authPrimary },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginRight: 4,
  },
  term: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
});
