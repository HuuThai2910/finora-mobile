import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import { NEUTRAL_PURPOSE_ICON, PURPOSE_ICONS } from '@/features/applications';
import type { MarketLoan } from '@/types/invest';
import { formatDong, formatPercentValue } from '@/utils/format';
import { daysUntil } from '../investRules';

/** Ô biểu tượng tròn theo mockup; khung giả lúc tải dùng cùng số đo. */
export const LOAN_TILE = 44;
/** Thanh tiến độ dày như mockup (thanh 4pt cũ khó đọc khi lướt nhanh). */
const BAR_HEIGHT = 8;

/**
 * Thẻ một khoản vay trên sàn (mockup 26/09/2026): mục đích vay, số tiền, lãi suất năm dạng "15%" (không hiện hạng),
 * thanh tiến độ gọi vốn, kỳ hạn kèm số ngày còn gọi vốn và phần trăm đã gọi. Không hiện mã đợt
 * gọi vốn (số trơn, người xem không hiểu). Biểu tượng theo mục đích vay, mã lạ dùng biểu tượng hồ
 * sơ chung. Cả thẻ là một nút mở chi tiết khoản vay, nên nhãn đọc gói đủ các con số trên thẻ.
 */
export default function LoanCard({ loan, onPress }: { loan: MarketLoan; onPress: () => void }) {
  // Giữ đủ 4 chữ số lẻ như mức đã công bố; trình đọc màn hình vẫn đọc "một năm".
  const rate = formatPercentValue(loan.annualRate, 4);
  const amount = formatDong(loan.amount);
  // Backend có thể trả >100% khi gọi dư trong lúc chốt sổ; thanh không được tràn khung.
  const funded = Math.min(Math.max(loan.fundedPercent, 0), 100);
  const icon = (loan.purposeCode && PURPOSE_ICONS[loan.purposeCode]) || NEUTRAL_PURPOSE_ICON;
  const title = loan.purpose || 'Khoản vay';
  // Chỉ đếm ngược khi đợt còn mở; qua hạn mà backend chưa kịp đóng thì không ghi "còn 0 ngày".
  const days = loan.status === 'OPEN' ? daysUntil(loan.fundingClosesAt) : null;
  const term = days != null && days > 0 ? `${loan.termMonths} tháng · còn ${days} ngày` : `${loan.termMonths} tháng`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Khoản vay ${loan.purpose}, ${amount}, lãi suất ${rate} một năm, kỳ hạn ${term}, đã gọi ${loan.fundedPercent}% vốn`}
      accessibilityHint="Mở chi tiết khoản vay"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.tile}>
        <Icon name={icon} size={22} color={Colors.authPrimary} />
      </View>

      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.titleBlock}>
            {/* Mục đích dài (kèm chi tiết người vay tự nhập) cắt một dòng; đủ chữ ở màn chi tiết. */}
            <Text style={styles.id} numberOfLines={1} maxFontSizeMultiplier={1.4}>
              {title}
            </Text>
            <Text style={styles.amount} maxFontSizeMultiplier={1.4}>
              {amount}
            </Text>
          </View>
          <View style={styles.side}>
            <View style={styles.pill}>
              <Text style={styles.pillText} maxFontSizeMultiplier={1.4}>
                {rate}
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
            <Text style={styles.meta} maxFontSizeMultiplier={1.4}>{term}</Text>
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
  // Viên lãi suất một màu cho mọi khoản: không còn hiện hạng nên không tô màu theo hạng.
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: Colors.blueBg },
  pillText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, color: Colors.tagBlueText, ...tabularNums },
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
