import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { AutoInvestMatch } from '@/types/invest';
import { formatDateTime, formatDong, formatPercentValue } from '@/utils/format';
import { skipLabel } from '../autoInvestDraft';

type Props = {
  matches: AutoInvestMatch[] | null;
  error: string | null;
};

/**
 * Các lần Auto-Invest xét một khoản vay mới: khớp bao nhiêu tiền, hoặc vì sao bỏ qua. Kết quả ghi
 * bằng chữ trong viên nhãn, không chỉ bằng màu.
 */
export default function AutoInvestMatchList({ matches, error }: Props) {
  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>{error}</Text>
      </View>
    );
  }
  if (!matches || matches.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>
          Chưa có khoản nào được xét. Auto-Invest chạy mỗi khi có khoản vay mới lên sàn.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {matches.map((m, i) => {
        const detail = [m.grade ? `Hạng ${m.grade}` : null, m.annualRate == null ? null : `${formatPercentValue(m.annualRate)}/năm`]
          .filter(Boolean)
          .join(', ');
        const result = m.matched && m.amount ? `Khớp ${formatDong(m.amount)}` : skipLabel(m.reason);
        return (
          <View
            key={`${m.at}-${m.loanId}`}
            style={[styles.row, i > 0 && styles.divider]}
            accessible
            accessibilityLabel={`${m.loanId}, ${detail}, ${result}`}
          >
            <View style={styles.main}>
              <Text style={styles.loan} maxFontSizeMultiplier={1.4}>{`Khoản vay ${m.loanId}`}</Text>
              <Text style={styles.meta} maxFontSizeMultiplier={1.4}>
                {[formatDateTime(m.at), detail].filter(Boolean).join(', ')}
              </Text>
            </View>
            <View style={[styles.pill, m.matched ? styles.pillMatched : styles.pillSkipped]}>
              <Text style={[styles.pillText, { color: m.matched ? Colors.tagGreenText : Colors.tagGrayText }]} maxFontSizeMultiplier={1.3}>
                {result}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  empty: { paddingVertical: Spacing.lg, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  main: { flex: 1, minWidth: 0 },
  loan: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  meta: { marginTop: 2, fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted, ...tabularNums },
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  pillMatched: { backgroundColor: Colors.greenBg },
  pillSkipped: { backgroundColor: Colors.grayBg },
  pillText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, ...tabularNums },
});
