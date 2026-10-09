import { StyleSheet, Text, View } from 'react-native';
import { REPAYMENT_METHOD_LABEL } from '@/features/products';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import type { MarketLoan } from '@/types/invest';
import { formatDong } from '@/utils/format';
import InfoGrid from './InfoGrid';

/**
 * Thông tin khoản vay ngoài thẻ đầu màn: lưới 2×2 ngăn bởi đường kẻ mảnh, cùng kiểu thẻ điều
 * khoản ở bước "Nhập khoản vay". Mệnh giá và mức tối thiểu là hai số nhà đầu tư cần trước khi
 * nhập số tiền; người vay luôn ẩn danh trên sàn.
 */
export default function LoanTermsCard({ loan }: { loan: MarketLoan }) {
  const items = [
    { label: 'Cách trả nợ', value: REPAYMENT_METHOD_LABEL[loan.repaymentMethod] ?? loan.repaymentMethod },
    { label: 'Người vay', value: 'Ẩn danh' },
    { label: 'Mệnh giá Note', value: formatDong(loan.noteDenomination) },
    { label: 'Đầu tư tối thiểu', value: formatDong(loan.minInvestmentAmount) },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
        Thông tin khoản vay
      </Text>
      <InfoGrid items={items} />
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
  title: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk, marginBottom: Spacing.xs },
});
