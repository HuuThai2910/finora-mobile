import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_, tabularNums } from '@/theme';
import { formatDong } from '@/utils/format';

export type FinancialRow = { label: string; value: number | string; emphasis?: boolean };

export default function FinancialRows({ rows }: { rows: readonly FinancialRow[] }) {
  return (
    <View>
      {rows.map((row, index) => (
        <View key={row.label} style={[styles.row, index > 0 && styles.divider]}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={[styles.value, row.emphasis && styles.emphasis]}>
            {typeof row.value === 'number' ? formatDong(row.value) : row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.lg, paddingVertical: Spacing.lg },
  divider: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  label: { ...Text_.micro, color: Colors.authMuted, flex: 1 },
  value: { ...Text_.microBold, color: Colors.authInk, textAlign: 'right', flexShrink: 1, ...tabularNums },
  emphasis: { ...Text_.bodyBold, color: Colors.authPrimary },
});

