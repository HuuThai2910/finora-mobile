import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { MarketLoan } from '@/types/invest';
import { formatDate, formatDateTime, formatDong } from '@/utils/format';
import { daysUntil, type FundingState } from '../investRules';

/** Thanh dày như thẻ khoản vay ngoài sàn, để hai màn đọc cùng một kiểu. */
const BAR_HEIGHT = 8;

/**
 * Dòng hạn gọi vốn theo trạng thái; đã đủ vốn thì hạn không còn ý nghĩa nên bỏ. Còn dưới một ngày
 * thì ghi cả giờ, vì "còn 1 ngày" cạnh đúng ngày hôm nay dễ đọc nhầm là còn tới mai.
 */
function deadlineText(state: FundingState, closesAt: string | null): string | null {
  if (!closesAt || state === 'FULLY_FUNDED') return null;
  if (state === 'EXPIRED') return `Hết hạn gọi vốn ngày ${formatDate(closesAt)}`;
  const days = daysUntil(closesAt);
  if (state !== 'OPEN' || days === null || days <= 0) return `Hạn gọi vốn ${formatDate(closesAt)}`;
  // Khoảng trắng không ngắt giữ "1 ngày" / "9 ngày" trên cùng một dòng.
  return days === 1
    ? `Hạn gọi vốn ${formatDateTime(closesAt)}, còn dưới 1 ngày`
    : `Hạn gọi vốn ${formatDate(closesAt)}, còn ${days} ngày`;
}

/**
 * Tiến độ gọi vốn: phần trăm và thanh tiến độ, hai ô số tiền đã gọi được / còn thiếu (còn thiếu là
 * trần của một lệnh), dòng cuối là hạn gọi vốn.
 */
export default function FundingProgressCard({ loan, state }: { loan: MarketLoan; state: FundingState }) {
  // Còn thiếu dù một Note thì chưa ghi 100%: làm tròn có thể đẩy 99,6% thành 100%.
  const percent = loan.remainingAmount > 0 ? Math.min(Math.max(loan.fundedPercent, 0), 99) : 100;
  const deadline = deadlineText(state, loan.fundingClosesAt);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          Tiến độ gọi vốn
        </Text>
        <Text style={styles.percent} maxFontSizeMultiplier={1.3}>{`${percent}%`}</Text>
      </View>

      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel="Tiến độ gọi vốn"
        accessibilityValue={{ min: 0, max: 100, now: percent }}
      >
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      <View style={styles.figures}>
        <Figure label="Đã gọi được" value={formatDong(loan.committedAmount)} />
        <Figure label="Còn thiếu" value={formatDong(loan.remainingAmount)} accent />
      </View>

      {deadline ? (
        <View style={styles.deadline}>
          <Icon name="clock" size={16} color={state === 'EXPIRED' ? Colors.tagRedText : Colors.authMuted} />
          <Text style={[styles.deadlineText, state === 'EXPIRED' && styles.deadlineExpired]} maxFontSizeMultiplier={1.4}>
            {deadline}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Figure({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.figure} accessible accessibilityLabel={`${label} ${value}`}>
      <Text style={styles.figureLabel} maxFontSizeMultiplier={1.3}>{label}</Text>
      <Text
        style={[styles.figureValue, accent && styles.figureAccent]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    paddingTop: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.md },
  title: { flexShrink: 1, fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk },
  percent: { fontFamily: FontFamily.extrabold, fontSize: 20, lineHeight: 27, color: Colors.authPrimary, ...tabularNums },
  track: {
    height: BAR_HEIGHT,
    marginTop: Spacing.md,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: Colors.authBorder,
    overflow: 'hidden',
  },
  fill: { height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, backgroundColor: Colors.authPrimary },
  figures: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  figure: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.scheduleTile,
  },
  figureLabel: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  figureValue: { marginTop: 2, fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk, ...tabularNums },
  figureAccent: { color: Colors.authPrimary },
  deadline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md },
  deadlineText: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  deadlineExpired: { fontFamily: FontFamily.medium, color: Colors.tagRedText },
});
