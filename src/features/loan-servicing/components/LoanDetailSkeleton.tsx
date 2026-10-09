import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';

type Props = {
  /** Nhãn đọc cho trình đọc màn hình, theo đúng màn đang tải. */
  label: string;
  /** Số thẻ giả dưới thẻ đầu. */
  cards?: number;
};

/**
 * Lần tải đầu của các màn chi tiết khoản vay, lịch trả và cơ cấu: thẻ đầu cùng dáng thẻ
 * tóm tắt (nhãn, số lớn, thanh tiến độ, dải số) rồi vài thẻ có tiêu đề và nút, để lúc dữ
 * liệu về bố cục không nhảy.
 */
export default function LoanDetailSkeleton({ label, cards = 2 }: Props) {
  return (
    <View style={styles.list} accessibilityLiveRegion="polite" accessibilityLabel={label}>
      <View style={styles.card}>
        <View style={styles.spread}>
          <Skeleton width={84} height={14} />
          <Skeleton width={104} height={26} radius={Radius.pill} />
        </View>
        <Skeleton width="64%" height={16} />
        <Skeleton width="58%" height={34} />
        <Skeleton height={8} radius={4} />
        <View style={styles.spread}>
          <Skeleton width="40%" height={32} />
          <Skeleton width="40%" height={32} />
        </View>
        <Skeleton height={44} radius={12} />
      </View>

      {Array.from({ length: cards }, (_, index) => (
        <View key={index} style={styles.card}>
          <Skeleton width="42%" height={18} />
          <Skeleton width="56%" height={30} />
          <Skeleton height={44} radius={Radius.pill} />
          <Skeleton height={44} radius={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.lg },
  card: {
    gap: 14,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  spread: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md },
});
