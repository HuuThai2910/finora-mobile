import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { InvestmentContract } from '@/types/invest';
import { formatDateTime, formatDong } from '@/utils/format';

const STATUS: Record<InvestmentContract['status'], { label: string; bg: string; fg: string }> = {
  PENDING_SIGNATURE: { label: 'Chờ bạn ký', bg: Colors.amberBg, fg: Colors.tagAmberText },
  SIGNING: { label: 'Đang xác nhận SmartCA', bg: Colors.blueBg, fg: Colors.tagBlueText },
  SIGNED: { label: 'Bạn đã ký', bg: Colors.greenBg, fg: Colors.tagGreenText },
};

/**
 * Tóm tắt hợp đồng đầu tư: phần vốn của bạn là con số lớn, bên dưới là mục đích, số Note, kỳ hạn,
 * hạn ký và còn bao nhiêu nhà đầu tư chưa ký.
 */
export default function ContractSummaryCard({ contract }: { contract: InvestmentContract }) {
  const status = STATUS[contract.status];
  const rows = [
    { label: 'Mục đích', value: contract.purpose },
    { label: 'Số Note', value: String(contract.noteCount) },
    { label: 'Kỳ hạn', value: `${contract.termMonths} tháng` },
    { label: 'Hạn ký', value: formatDateTime(contract.expiresAt) },
    { label: 'Nhà đầu tư chưa ký', value: String(contract.remainingLenderSignatures) },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.pill, { backgroundColor: status.bg }]}>
          <Text style={[styles.pillText, { color: status.fg }]} maxFontSizeMultiplier={1.4}>{status.label}</Text>
        </View>
        <Text style={styles.reference} numberOfLines={1} maxFontSizeMultiplier={1.3}>{contract.reference}</Text>
      </View>

      <Text style={styles.label} maxFontSizeMultiplier={1.4}>Vốn của bạn trong hợp đồng</Text>
      <Text style={styles.amount} maxFontSizeMultiplier={1.3}>{formatDong(contract.amount)}</Text>

      <View style={styles.rows}>
        {rows.map((r, i) => (
          <View key={r.label} style={[styles.row, i > 0 && styles.divider]}>
            <Text style={styles.rowLabel} maxFontSizeMultiplier={1.4}>{r.label}</Text>
            <Text style={styles.rowValue} maxFontSizeMultiplier={1.4}>{r.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17 },
  reference: { flex: 1, textAlign: 'right', fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  label: { marginTop: Spacing.lg, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  amount: { marginTop: 2, fontFamily: FontFamily.extrabold, fontSize: 26, lineHeight: 36, letterSpacing: -0.4, color: Colors.authInk, ...tabularNums },
  rows: { marginTop: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, minHeight: 44 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  rowLabel: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
});
