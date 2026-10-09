import { StyleSheet, Text, View } from 'react-native';
import { DetailCard } from '@/features/applications';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing, tabularNums } from '@/theme';
import { formatDong, formatLocalDate, formatRecentTime } from '@/utils/format';
import type { ServicingLoanSummary } from '../types';

type Props = {
  loan: ServicingLoanSummary;
  /** Số thứ tự kỳ tới trong lịch hợp đồng, nếu khớp được ngày đến hạn. */
  nextPeriod: number | null;
};

type Tone = 'red' | 'blue' | 'neutral';
type Tile = { key: string; label: string; value: string; sub?: string; tone: Tone };

/** `label`: chữ xám `authMuted` chỉ đạt ~4,4:1 trên nền đỏ nhạt nên ô quá hạn dùng chữ đỏ đậm. */
const TONES: Record<Tone, { bg: string; fg: string; label: string }> = {
  red: { bg: Colors.redBg, fg: Colors.tagRedText, label: Colors.tagRedText },
  blue: { bg: Colors.tintBlue, fg: Colors.authPrimary, label: Colors.authMuted },
  neutral: { bg: Colors.scheduleTile, fg: Colors.authInk, label: Colors.authMuted },
};

/**
 * Tối đa hai ô, ưu tiên điều người vay phải làm: khoản quá hạn, rồi kỳ tới, rồi ngày đáo
 * hạn. Mọi số lấy từ số liệu đồng bộ của khoản vay, không cộng dồn từ các kỳ.
 */
function tilesOf(loan: ServicingLoanSummary, nextPeriod: number | null): Tile[] {
  const tiles: Tile[] = [];
  if (loan.overdueAmount > 0) {
    tiles.push({
      key: 'overdue',
      label: loan.daysPastDue > 0 ? `Quá hạn ${loan.daysPastDue} ngày` : 'Đang quá hạn',
      value: formatDong(loan.overdueAmount),
      tone: 'red',
    });
  }
  if (loan.nextDueDate && loan.status !== 'SETTLED' && loan.status !== 'WRITTEN_OFF') {
    tiles.push({
      key: 'next',
      label: nextPeriod ? `Kỳ tới (kỳ ${nextPeriod})` : 'Kỳ tới',
      value: formatDong(loan.nextDueAmount),
      sub: `Đến hạn ${formatLocalDate(loan.nextDueDate)}`,
      tone: 'blue',
    });
  }
  tiles.push({ key: 'maturity', label: 'Ngày đáo hạn', value: formatLocalDate(loan.maturityDate), tone: 'neutral' });
  return tiles.slice(0, 2);
}

/**
 * Thẻ đầu màn lịch trả của khoản vay đang trả. Danh sách kỳ bên dưới là lịch chốt trong
 * hợp đồng (Loan Service trả snapshot đó), còn dư nợ và kỳ tới là số liệu đồng bộ mới nhất;
 * câu cuối thẻ nói rõ điều này để người vay không đối chiếu nhầm sau khi trả trước hay cơ cấu.
 */
export default function ScheduleOverviewCard({ loan, nextPeriod }: Props) {
  const amount = formatDong(loan.totalOutstanding);

  return (
    <DetailCard>
      <View accessible accessibilityLabel={`Dư nợ còn lại ${amount}`}>
        <Text style={styles.amountLabel}>Dư nợ còn lại</Text>
        <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} maxFontSizeMultiplier={1.2}>
          {amount}
        </Text>
      </View>

      <View style={styles.tiles}>
        {tilesOf(loan, nextPeriod).map(tile => {
          const tone = TONES[tile.tone];
          return (
            <View
              key={tile.key}
              style={[styles.tile, { backgroundColor: tone.bg }]}
              accessible
              accessibilityLabel={`${tile.label}: ${tile.value}${tile.sub ? `, ${tile.sub}` : ''}`}
            >
              <Text style={[styles.tileLabel, { color: tone.label }]} maxFontSizeMultiplier={1.3}>
                {tile.label}
              </Text>
              <Text style={[styles.tileValue, { color: tone.fg }]} maxFontSizeMultiplier={1.3}>
                {tile.value}
              </Text>
              {tile.sub ? (
                <Text style={styles.tileSub} maxFontSizeMultiplier={1.3}>
                  {tile.sub}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <Text style={styles.fine}>
        {`Các kỳ bên dưới theo lịch trong hợp đồng. Dư nợ và kỳ tới cập nhật ${formatRecentTime(loan.dataAsOf).toLowerCase()}.`}
      </Text>
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  amountLabel: { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  amount: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: Colors.authInk,
    ...tabularNums,
  },
  tiles: { flexDirection: 'row', gap: Spacing.md },
  tile: { flex: 1, minWidth: 0, gap: 2, paddingHorizontal: Spacing.lg, paddingVertical: 10, borderRadius: Radius.sm },
  tileLabel: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17 },
  tileValue: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 22, ...tabularNums },
  tileSub: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted, ...tabularNums },
  fine: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
});
