import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';

export type InfoGridItem = { label: string; value: string };

/**
 * Lưới hai cột nhãn–giá trị ngăn bởi đường kẻ mảnh, cùng kiểu thẻ điều khoản ở bước "Nhập khoản
 * vay": kẻ ngang giữa hai hàng, kẻ dọc giữa hai cột. Số ô lẻ thì ô cuối trải hết hàng.
 */
export default function InfoGrid({ items }: { items: InfoGridItem[] }) {
  const rows: InfoGridItem[][] = [];
  for (let index = 0; index < items.length; index += 2) rows.push(items.slice(index, index + 2));

  return (
    <>
      {rows.map((row, rowIndex) => (
        <View key={row[0].label} style={[styles.row, rowIndex > 0 && styles.rowDivided]}>
          {row.map((item, cellIndex) => (
            <Fragment key={item.label}>
              {cellIndex > 0 ? <View style={styles.columnDivider} /> : null}
              <View
                style={[styles.cell, cellIndex > 0 ? styles.cellRight : styles.cellLeft]}
                accessible
                accessibilityLabel={`${item.label}: ${item.value}`}
              >
                <Text style={styles.label} maxFontSizeMultiplier={1.4}>{item.label}</Text>
                <Text style={styles.value} maxFontSizeMultiplier={1.4}>{item.value}</Text>
              </View>
            </Fragment>
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  // Kẻ ngang nằm trong phần đệm của thẻ nên không chạm hai mép.
  rowDivided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.authBorder },
  // Kẻ dọc giữa hai cột, hở trên dưới để không cắt qua kẻ ngang.
  columnDivider: { width: StyleSheet.hairlineWidth, marginVertical: Spacing.lg, backgroundColor: Colors.authBorder },
  cell: { flex: 1, minWidth: 0, gap: Spacing.xxs, paddingVertical: 10 },
  cellLeft: { paddingRight: Spacing.lg },
  cellRight: { paddingLeft: Spacing.lg },
  label: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  value: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
});
