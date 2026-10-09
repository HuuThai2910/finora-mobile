import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { TopUpDetailRow } from '../mappers/topUp';

/**
 * Thẻ "Chi tiết giao dịch": các mã dùng khi cần tra soát với hỗ trợ hoặc cổng thanh toán. Mã dài
 * (UUID) cắt ở giữa để vẫn thấy đầu và đuôi mã, và cho phép chọn để sao chép.
 */
export default function TopUpDetailsCard({ rows }: { rows: TopUpDetailRow[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
        Chi tiết giao dịch
      </Text>
      {rows.map((row, i) => (
        <View key={row.label} style={[styles.row, i > 0 && styles.divider]}>
          <Text style={styles.label} maxFontSizeMultiplier={1.4}>{row.label}</Text>
          <Text
            style={styles.value}
            numberOfLines={1}
            ellipsizeMode="middle"
            selectable
            maxFontSizeMultiplier={1.4}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 14,
    paddingBottom: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  title: { marginBottom: Spacing.xs, fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 22, color: Colors.authInk },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg, minHeight: 44 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  label: { flexShrink: 0, fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  value: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authInk,
    ...tabularNums,
  },
});
