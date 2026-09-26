import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, SoftShadow, Spacing, lh, tabularNums } from '@/theme';
import { formatAnnualRate, formatDate, formatDong } from '@/utils/format';

type Props = {
  productName: string;
  amount: number;
  termMonths: number;
  annualInterestRate: number;
  expectedDisbursementDate: string;
};

type Row = { label: string; value: string; accent?: boolean };

/**
 * Bản đọc lại lựa chọn bước 1; không tạo ô nhập thứ hai cho cùng amount/term.
 *
 * Thẻ trắng nằm trên nền sóng, mỗi dòng nhãn trái – giá trị phải, ngăn bằng kẻ
 * mảnh như thẻ điều khoản ở bước 1. Giá trị dài (tên sản phẩm) xuống dòng và
 * canh phải, không bị cắt. Lãi suất viết kiểu Việt Nam "12,50%/năm" như các màn khác.
 */
export default function LoanSelectionSummary({
  productName,
  amount,
  termMonths,
  annualInterestRate,
  expectedDisbursementDate,
}: Props) {
  const rows: Row[] = [
    { label: 'Sản phẩm', value: productName },
    { label: 'Số tiền vay', value: formatDong(amount), accent: true },
    { label: 'Kỳ hạn', value: `${termMonths} tháng` },
    { label: 'Lãi suất cơ sở ban đầu', value: formatAnnualRate(annualInterestRate) },
    { label: 'Ngày giải ngân dự kiến', value: formatDate(expectedDisbursementDate) },
  ];

  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[styles.row, index > 0 && styles.rowDivided]}
          accessible
          accessibilityLabel={`${row.label}: ${row.value}`}
        >
          <Text style={styles.label}>{row.label}</Text>
          <Text style={[styles.value, row.accent && styles.valueAccent]}>{row.value}</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  // Kẻ nằm trong phần đệm của thẻ nên không chạm hai mép, như mockup.
  rowDivided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.authBorder },
  label: {
    flexShrink: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro, 1.45),
    color: Colors.authMuted,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.authInk,
    ...tabularNums,
  },
  valueAccent: { color: Colors.authPrimary },
});
