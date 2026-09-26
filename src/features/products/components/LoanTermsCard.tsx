import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Radius, SoftShadow, Spacing, lh } from '@/theme';
import type { LoanTermsItem } from '../mappers/loanSelection';

type Props = {
  /** Bốn ô, xếp 2×2 theo thứ tự đọc: trái sang phải, trên xuống dưới. */
  items: readonly LoanTermsItem[];
};

/**
 * Thẻ điều khoản của Product ở bước 1: lưới 2×2 ngăn bởi đường kẻ mảnh như
 * mockup. Giá trị dài (khung lãi suất lẻ) xuống dòng trong ô, không bị cắt.
 */
export default function LoanTermsCard({ items }: Props) {
  const rows = [items.slice(0, 2), items.slice(2, 4)];

  return (
    <View style={styles.card}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, rowIndex > 0 && styles.rowDivided]}>
          {row.map((item, cellIndex) => (
            <Fragment key={item.key}>
              {cellIndex > 0 ? <View style={styles.columnDivider} /> : null}
              <View
                style={[styles.cell, cellIndex > 0 ? styles.cellRight : styles.cellLeft]}
                accessible
                accessibilityLabel={`${item.label}: ${item.value}`}
              >
                <Text style={styles.label}>{item.label}</Text>
                <Text style={[styles.value, item.accent && styles.valueAccent]}>{item.value}</Text>
              </View>
            </Fragment>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  row: { flexDirection: 'row' },
  // Kẻ ngang nằm trong phần đệm của thẻ nên không chạm hai mép, như mockup.
  rowDivided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.authBorder },
  // Kẻ dọc giữa hai cột, hở trên dưới để không cắt qua kẻ ngang.
  columnDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: Spacing.lg,
    backgroundColor: Colors.authBorder,
  },
  cell: { flex: 1, minWidth: 0, gap: Spacing.xxs, paddingVertical: Spacing.md },
  // 12pt mỗi bên đường kẻ dọc: đủ để nhãn dài nhất ("Khung có thể áp dụng") vẫn
  // nằm một dòng ở máy 360pt.
  cellLeft: { paddingRight: Spacing.lg },
  cellRight: { paddingLeft: Spacing.lg },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, LineHeight.heading),
    color: Colors.authMuted,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.35),
    color: Colors.authInk,
  },
  valueAccent: { color: Colors.green },
});
