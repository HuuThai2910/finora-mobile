import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, Text_ } from '@/theme';
import { PItem } from '@/components/phone';
import { formatVND } from '@/utils/format';
import type { LoanProductCatalog } from '@/types/loan';
import { REPAYMENT_METHOD_LABEL } from '../constant';

/** Thẻ sản phẩm vay phân biệt lãi suất cơ sở với khung có thể áp dụng sau thẩm định. */
export default function ProductCard({
  product,
  onPress,
}: {
  product: LoanProductCatalog;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, lãi suất cơ sở ${product.annualInterestRate}% một năm`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.head}>
        <View style={styles.title}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.code}>{product.code}</Text>
        </View>

        <View style={styles.rate}>
          <Text style={styles.rateValue}>
            {product.annualInterestRate.toString().replace('.', ',')}%
          </Text>
          <Text style={styles.rateUnit}>cơ sở / năm</Text>
        </View>
      </View>

      <PItem
        label="Khung lãi suất"
        value={`${product.minAnnualInterestRate}% – ${product.maxAnnualInterestRate}%/năm`}
      />
      <PItem
        label="Khoản vay"
        value={`${formatVND(product.minAmount)} – ${formatVND(product.maxAmount)}`}
      />
      <PItem
        label="Kỳ hạn"
        value={`${product.minTermMonths} – ${product.maxTermMonths} tháng`}
        valueTone="brand"
      />
      <PItem
        label="Kiểu tính lãi"
        value={REPAYMENT_METHOD_LABEL[product.repaymentMethod] ?? product.repaymentMethod}
        last
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  pressed: { opacity: 0.75 },
  head: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.lg },
  title: { flexShrink: 1, gap: 2 },
  name: { ...Text_.bodyBold, color: Colors.ink },
  code: { ...Text_.caption, color: Colors.ink3 },
  rate: {
    backgroundColor: Colors.brand50,
    borderWidth: 1,
    borderColor: Colors.brand100,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  rateValue: { fontFamily: FontFamily.extrabold, fontSize: FontSize.heading, color: Colors.brand },
  rateUnit: { fontFamily: FontFamily.semibold, fontSize: FontSize.caption, color: Colors.brand600 },
});
