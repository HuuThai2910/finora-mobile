import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { LOAN_TILE } from './LoanCard';

/** Thẻ giả cùng khung với `LoanCard`, để lúc dữ liệu về bố cục không nhảy. */
function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={LOAN_TILE} height={LOAN_TILE} radius={LOAN_TILE / 2} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Skeleton width="34%" height={16} />
          <Skeleton width={72} height={22} radius={Radius.pill} />
        </View>
        <Skeleton width="52%" height={20} />
        <Skeleton height={8} radius={4} />
        <View style={styles.row}>
          <Skeleton width="28%" height={12} />
          <Skeleton width="20%" height={12} />
        </View>
      </View>
    </View>
  );
}

/** Trạng thái đang tải lần đầu của sàn khoản vay. */
export default function MarketSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <View style={styles.list} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải sàn khoản vay">
      {Array.from({ length: cards }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  body: { flex: 1, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
});
