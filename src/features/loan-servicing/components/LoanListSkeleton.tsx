import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { LOAN_TILE } from './LoanListCard';

/** Thẻ giả cùng khung với `LoanListCard`, để lúc dữ liệu về bố cục không nhảy. */
function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={LOAN_TILE} height={LOAN_TILE} radius={LOAN_TILE / 2} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Skeleton width="58%" height={14} />
          <Skeleton width={74} height={22} radius={Radius.pill} />
        </View>
        <Skeleton width="62%" height={24} />
        <Skeleton width="70%" height={12} />
        <View style={styles.row}>
          <Skeleton width="46%" height={12} />
          <Skeleton width={80} height={14} />
        </View>
      </View>
    </View>
  );
}

/** Lần tải đầu của danh sách khoản vay; chip lọc chỉ hiện khi đã có dữ liệu nên không giữ chỗ. */
export default function LoanListSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <View style={styles.list} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải danh sách khoản vay">
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
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  body: { flex: 1, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
});
