import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { PortfolioPosition } from '@/types/invest';
import { formatDong, formatPercentValue } from '@/utils/format';

/** Hạng A xanh lá, B xanh dương, C/D hổ phách, E đỏ — cùng cặp màu viên hạng trên Sàn. */
const GRADE_TONE: Record<string, { bg: string; fg: string }> = {
  A: { bg: Colors.greenBg, fg: Colors.tagGreenText },
  B: { bg: Colors.blueBg, fg: Colors.tagBlueText },
  C: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  D: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  E: { bg: Colors.redBg, fg: Colors.tagRedText },
};
const NEUTRAL = { bg: Colors.grayBg, fg: Colors.tagGrayText };

const TILE = 44;
const BAR_HEIGHT = 8;

type Props = {
  position: PortfolioPosition;
  /** Mở sổ lệnh của khoản vay trên chợ Notes để bán bớt Note. */
  onSell: () => void;
};

/**
 * Một khoản vay trong danh mục: tên và hạng, thanh gốc đã thu hồi, dư nợ còn lại và lãi đã nhận,
 * rồi lối sang chợ Notes để bán Note trước hạn.
 */
export default function PositionCard({ position: p, onSell }: Props) {
  const tone = (p.grade && GRADE_TONE[p.grade]) || NEUTRAL;
  const rate = formatPercentValue(p.annualRate);
  // Phần gốc đã về túi; thanh không được tràn khung nếu backend làm tròn dư một chút.
  const repaidShare = p.principal > 0 ? Math.min(Math.max(p.principalRepaid / p.principal, 0), 1) : 0;
  const repaidPercent = Math.round(repaidShare * 100);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.tile}>
          <Icon name="chart" size={22} color={Colors.authPrimary} />
        </View>
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.title} maxFontSizeMultiplier={1.4}>{`Khoản vay #${p.loanId}`}</Text>
            <View style={[styles.pill, { backgroundColor: tone.bg }]}>
              <Text style={[styles.pillText, { color: tone.fg }]} maxFontSizeMultiplier={1.4}>
                {p.grade ? `${p.grade} - ${rate}` : rate}
              </Text>
            </View>
          </View>
          <Text style={styles.meta} numberOfLines={1} maxFontSizeMultiplier={1.4}>
            {[p.purpose, `${p.termMonths} tháng`].filter(Boolean).join(', ')}
          </Text>
        </View>
      </View>

      <View style={styles.progressHead}>
        <Text style={styles.progressLabel} maxFontSizeMultiplier={1.4}>
          {`Đã thu hồi ${repaidPercent}% gốc`}
        </Text>
        <Text style={styles.progressLabel} maxFontSizeMultiplier={1.4}>
          {`${p.noteCount} Note, ${formatPercentValue(p.sharePercent)} khoản vay`}
        </Text>
      </View>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel="Gốc đã thu hồi"
        accessibilityValue={{ min: 0, max: 100, now: repaidPercent }}
      >
        <View style={[styles.fill, { width: `${repaidPercent}%` }]} />
      </View>

      <View style={styles.figures}>
        <Figure label="Dư nợ còn lại" value={formatDong(p.outstanding)} />
        <Figure label="Lãi đã nhận" value={formatDong(p.interestReceived)} accent={p.interestReceived > 0} />
      </View>

      <Pressable
        onPress={onSell}
        accessibilityRole="button"
        accessibilityLabel={`Bán Note của khoản vay ${p.loanId} trên chợ Notes`}
        style={({ pressed }) => [styles.sell, pressed && styles.pressed]}
      >
        <Icon name="layers" size={18} color={Colors.authPrimary} />
        <Text style={styles.sellText} maxFontSizeMultiplier={1.4}>Bán Note trên chợ</Text>
        <Icon name="chevronRight" size={18} color={Colors.chevronMuted} />
      </Pressable>
    </View>
  );
}

function Figure({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.figure} accessible accessibilityLabel={`${label} ${value}`}>
      <Text style={styles.figureLabel} maxFontSizeMultiplier={1.3}>{label}</Text>
      <Text style={[styles.figureValue, accent && styles.figureAccent]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 4,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: TILE / 2,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  title: { flexShrink: 1, fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk },
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, ...tabularNums },
  meta: { marginTop: 2, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, marginTop: Spacing.lg },
  progressLabel: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted, ...tabularNums },
  track: {
    height: BAR_HEIGHT,
    marginTop: 6,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: Colors.authBorder,
    overflow: 'hidden',
  },
  fill: { height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, backgroundColor: Colors.authPrimary },
  figures: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  figure: { flex: 1, minWidth: 0, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.sm, backgroundColor: Colors.scheduleTile },
  figureLabel: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  figureValue: { marginTop: 2, fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk, ...tabularNums },
  // Tiền lãi đã về ví: xanh lá đậm (đạt 5,17:1 trên nền ô) như số tiền vào ở lịch sử ví.
  figureAccent: { color: Colors.walletHistoryIn },
  sell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.rowDivider,
  },
  pressed: { opacity: 0.6 },
  sellText: { flex: 1, fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authPrimary },
});
