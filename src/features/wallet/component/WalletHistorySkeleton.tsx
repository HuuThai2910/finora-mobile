import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { TX_TILE } from './WalletTxCard';

/** Thẻ giả cùng khung với `WalletTxCard`, để lúc dữ liệu về bố cục không nhảy. */
function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={TX_TILE} height={TX_TILE} radius={12} />
      <View style={styles.body}>
        <Skeleton width="78%" height={14} />
        <Skeleton width="48%" height={12} />
      </View>
      <Skeleton width={84} height={16} />
    </View>
  );
}

/** Trạng thái đang tải lần đầu của danh sách giao dịch: tiêu đề tháng và vài thẻ giả. */
export default function WalletHistorySkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <View style={styles.list} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải lịch sử ví">
      <Skeleton width={110} height={14} style={styles.month} />
      {Array.from({ length: cards }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.md },
  month: { marginTop: Spacing.xs, marginBottom: Spacing.xs },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  body: { flex: 1, gap: 8 },
});
