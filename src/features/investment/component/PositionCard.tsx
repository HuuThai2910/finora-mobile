import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { InvestmentContract, PortfolioPosition } from '@/types/invest';
import { NEUTRAL_PURPOSE_ICON, PURPOSE_ICONS } from '@/features/applications';
import { formatDong, formatPercentValue } from '@/utils/format';
import { displayCodesLine, purposeCodeFromLabel, splitPurpose } from '@/utils/loanSummary';

/** Vị thế đã kết thúc vẫn hiện để giữ lịch sử; nhãn nói rõ vì sao không còn dòng tiền. */
const ENDED_LABEL: Partial<Record<PortfolioPosition['status'], { text: string; bg: string; fg: string }>> = {
  CLOSED: { text: 'Đã tất toán', bg: Colors.grayBg, fg: Colors.tagGrayText },
  DEFAULTED: { text: 'Nợ xấu', bg: Colors.redBg, fg: Colors.tagRedText },
};

const TILE = 44;
const BAR_HEIGHT = 8;

type Props = {
  position: PortfolioPosition;
  contract: InvestmentContract | null;
  onViewContract: (contractNumber: string) => void;
  /** Mở sổ lệnh của khoản vay trên chợ Notes để bán bớt Note. */
  onSell: () => void;
};

/**
 * Một khoản vay trong danh mục, cùng cách gọi tên với thẻ trên Sàn: biểu tượng và tên theo mục đích vay, viên lãi
 * suất (không hiện hạng), dòng kỳ hạn; rồi thanh gốc đã thu hồi, dư nợ còn lại, lãi đã nhận và lối sang chợ Notes.
 */
export default function PositionCard({ position: p, contract, onViewContract, onSell }: Props) {
  const rate = formatPercentValue(p.annualRate);
  // Phần gốc đã về túi; thanh không được tràn khung nếu backend làm tròn dư một chút.
  const repaidShare = p.principal > 0 ? Math.min(Math.max(p.principalRepaid / p.principal, 0), 1) : 0;
  const repaidPercent = Math.round(repaidShare * 100);
  const ended = ENDED_LABEL[p.status];
  // Chỉ Note còn hoạt động mới bán được trên chợ; khoản đã tất toán không còn Note để bán.
  const canSell = p.status === 'ACTIVE';
  // Tiêu đề là mục đích vay; kỳ hạn và phương án người vay tự viết ở dòng phụ; mã HS-/HĐ- dòng dưới cùng.
  const purpose = splitPurpose(p.purpose ?? contract?.purpose);
  const title = purpose.label || 'Khoản vay';
  const code = purposeCodeFromLabel(purpose.label);
  const icon = (code && PURPOSE_ICONS[code]) || NEUTRAL_PURPOSE_ICON;
  const meta = [p.termMonths ? `${p.termMonths} tháng` : null, purpose.detail].filter(Boolean).join(' · ');
  const codes = contract ? displayCodesLine(contract.applicationCode, contract.contractCode) : null;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.tile}>
          <Icon name={icon} size={22} color={Colors.authPrimary} />
        </View>
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.title} maxFontSizeMultiplier={1.4}>
              {title}
            </Text>
            {/* Viên lãi suất một màu như thẻ Sàn: không hiện hạng. */}
            <View style={[styles.pill, styles.ratePill]}>
              <Text style={[styles.pillText, styles.ratePillText]} maxFontSizeMultiplier={1.4}>
                {rate}
              </Text>
            </View>
          </View>
          {meta ? (
            <Text style={styles.meta} numberOfLines={1} maxFontSizeMultiplier={1.4}>
              {meta}
            </Text>
          ) : null}
          {codes ? (
            <Text style={styles.references} numberOfLines={2} maxFontSizeMultiplier={1.3}>
              {codes}
            </Text>
          ) : null}
          {ended ? (
            <View style={[styles.pill, styles.endedPill, { backgroundColor: ended.bg }]}>
              <Text style={[styles.pillText, { color: ended.fg }]} maxFontSizeMultiplier={1.4}>{ended.text}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.progressHead}>
        <Text style={styles.progressLabel} maxFontSizeMultiplier={1.4}>
          {`Đã thu hồi ${repaidPercent}% gốc`}
        </Text>
        <Text style={styles.progressLabel} maxFontSizeMultiplier={1.4}>
          {`${p.noteCount} phần vốn, ${formatPercentValue(p.sharePercent)} khoản vay`}
        </Text>
      </View>

      {p.daysPastDue > 0 ? (
        <View style={[styles.risk, p.debtGroup >= 3 && styles.riskHigh]}>
          <Icon name="alert" size={18} color={p.debtGroup >= 3 ? Colors.red : Colors.tagAmberText} />
          <View style={styles.riskTextBlock}>
            <Text style={styles.riskTitle}>{`Quá hạn ${p.daysPastDue} ngày · Nhóm nợ ${p.debtGroup}`}</Text>
            <Text style={styles.riskDetail}>{`Số tiền quá hạn ${formatDong(p.overdueAmount)}`}</Text>
          </View>
        </View>
      ) : null}
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
        {p.prepaymentFeeReceived > 0 ? (
          <Figure label="Phí trả trước được chia" value={formatDong(p.prepaymentFeeReceived)} accent />
        ) : null}
      </View>

      {contract ? (
        <Pressable
          onPress={() => onViewContract(contract.reference)}
          accessibilityRole="button"
          accessibilityLabel={contract.contractCode ? `Xem hợp đồng ${contract.contractCode}` : 'Xem hợp đồng'}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Icon name="file" size={18} color={Colors.authPrimary} />
          <Text style={styles.actionText} maxFontSizeMultiplier={1.4}>Xem hợp đồng đã ký</Text>
          <Icon name="chevronRight" size={18} color={Colors.chevronMuted} />
        </Pressable>
      ) : null}

      {canSell ? (
        <Pressable
          onPress={onSell}
          accessibilityRole="button"
          accessibilityLabel={`Chuyển nhượng phần vốn của khoản vay ${p.loanId} trên chợ chuyển nhượng`}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Icon name="layers" size={18} color={Colors.authPrimary} />
          <Text style={styles.actionText} maxFontSizeMultiplier={1.4}>Chuyển nhượng phần vốn</Text>
          <Icon name="chevronRight" size={18} color={Colors.chevronMuted} />
        </Pressable>
      ) : null}
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
  ratePill: { backgroundColor: Colors.blueBg },
  ratePillText: { color: Colors.tagBlueText },
  endedPill: { alignSelf: 'flex-start', marginTop: Spacing.xs },
  pillText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, ...tabularNums },
  meta: { marginTop: 2, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  references: { marginTop: 3, fontFamily: FontFamily.regular, fontSize: 11.5, lineHeight: 16, color: Colors.authPrimary },
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
  risk: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: Colors.amberBg,
  },
  riskHigh: { backgroundColor: Colors.redBg },
  riskTextBlock: { flex: 1 },
  riskTitle: { fontFamily: FontFamily.semibold, fontSize: 13, color: Colors.authInk },
  riskDetail: { marginTop: 2, fontFamily: FontFamily.regular, fontSize: 12, color: Colors.authMuted },
  figures: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  figure: { flex: 1, minWidth: 0, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.sm, backgroundColor: Colors.scheduleTile },
  figureLabel: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  figureValue: { marginTop: 2, fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk, ...tabularNums },
  // Tiền lãi đã về ví: xanh lá đậm (đạt 5,17:1 trên nền ô) như số tiền vào ở lịch sử ví.
  figureAccent: { color: Colors.walletHistoryIn },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.rowDivider,
  },
  pressed: { opacity: 0.6 },
  actionText: { flex: 1, fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authPrimary },
});
