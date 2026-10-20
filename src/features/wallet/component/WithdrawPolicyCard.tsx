import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { WithdrawalPolicy } from '@/types/wallet';
import { withdrawalPolicyFootnote, withdrawalPolicyRows } from '../mappers/withdrawal';

/**
 * Thẻ "Hạn mức rút tiền": tối thiểu mỗi lần, còn được rút hôm nay và phí, đúng số Payment trả về; dòng chú thích nói
 * hạn mức ngày tính theo ngày nghiệp vụ Việt Nam và lệnh thất bại không bị tính.
 */
export default function WithdrawPolicyCard({ policy }: { policy: WithdrawalPolicy }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
        Hạn mức rút tiền
      </Text>
      {withdrawalPolicyRows(policy).map((row, i) => (
        <View key={row.label} style={[styles.row, i > 0 && styles.divider]} accessible accessibilityLabel={`${row.label}: ${row.value}`}>
          <Text style={styles.label} maxFontSizeMultiplier={1.4}>{row.label}</Text>
          <Text style={styles.value} maxFontSizeMultiplier={1.4}>{row.value}</Text>
        </View>
      ))}
      <Text style={styles.footnote} maxFontSizeMultiplier={1.4}>{withdrawalPolicyFootnote(policy)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 14,
    paddingBottom: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  title: { marginBottom: Spacing.xs, fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 22, color: Colors.authInk },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg, minHeight: 40 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  label: { flexShrink: 1, fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  value: { flexShrink: 0, fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
  footnote: { marginTop: Spacing.sm, fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
});
