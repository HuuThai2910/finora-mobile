import { StyleSheet, Text, View } from 'react-native';
import { PItem } from '@/components/phone';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';

type Props = {
  onOpenPortfolio: () => void;
  onOpenPendingContract: () => void;
};

/**
 * Điểm vào các tác vụ riêng của nhà đầu tư trong tab Ví.
 *
 * Khối này nằm ngoài danh sách giao dịch để nhà đầu tư vẫn mở được hợp đồng
 * cần ký khi ví chưa phát sinh giao dịch hoặc lịch sử ví đang tạm lỗi.
 */
export default function InvestorWalletActions({
  onOpenPortfolio,
  onOpenPendingContract,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
        Dành cho nhà đầu tư
      </Text>
      <View style={styles.card}>
        <PItem
          label="Danh mục đầu tư"
          sub="Theo dõi các khoản đã góp vốn"
          icon="chart"
          onPress={onOpenPortfolio}
        />
        <PItem
          label="Hợp đồng chờ ký"
          sub="Mở PDF và xác nhận phần vốn của bạn"
          icon="file"
          onPress={onOpenPendingContract}
          last
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.xl },
  heading: {
    marginBottom: Spacing.sm,
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authInk,
  },
  card: {
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
});
