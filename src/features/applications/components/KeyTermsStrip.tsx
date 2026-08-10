import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_, tabularNums } from '@/theme';

export type KeyTerm = { label: string; value: string };

/**
 * Ba số liệu cốt lõi (số tiền, kỳ hạn, lãi suất) đặt cạnh nhau, ngăn bằng nét
 * mảnh thay vì bọc trong thẻ riêng. Nhóm bằng khoảng trắng giúp phần còn lại
 * của màn không bị chuỗi thẻ giống hệt nhau làm phẳng phân cấp.
 */
export default function KeyTermsStrip({ terms }: { terms: readonly KeyTerm[] }) {
  return (
    <View style={styles.row}>
      {terms.map((term, index) => (
        <View key={term.label} style={[styles.cell, index > 0 && styles.divider]}>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {term.value}
          </Text>
          <Text style={styles.label}>{term.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: Spacing.xl },
  cell: { flex: 1, gap: Spacing.xs, paddingHorizontal: Spacing.md },
  divider: { borderLeftWidth: 1, borderLeftColor: Colors.line },
  value: { ...Text_.bodyBold, color: Colors.ink, ...tabularNums },
  label: { ...Text_.caption, color: Colors.ink3 },
});
