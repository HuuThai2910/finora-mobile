import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { CONTRACT_TILE } from './ContractListCard';

/** Thẻ giả cùng khung với `ContractListCard`, để lúc dữ liệu về bố cục không nhảy. */
function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={CONTRACT_TILE} height={CONTRACT_TILE} radius={CONTRACT_TILE / 2} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Skeleton width="58%" height={14} />
          <Skeleton width={64} height={22} radius={Radius.pill} />
        </View>
        <Skeleton width="52%" height={24} />
        <Skeleton width="60%" height={12} />
        <View style={styles.row}>
          <Skeleton width="54%" height={12} />
          <Skeleton width={96} height={14} />
        </View>
      </View>
    </View>
  );
}

/** Trạng thái đang tải lần đầu của danh sách hợp đồng. */
export default function ContractListSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <View
      style={styles.list}
      accessibilityLiveRegion="polite"
      accessibilityLabel="Đang tải danh sách hợp đồng"
    >
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
