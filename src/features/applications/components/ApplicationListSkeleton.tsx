import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { APPLICATION_TILE } from './ApplicationCard';

/** Thẻ giả cùng khung với `ApplicationCard`, để lúc dữ liệu về bố cục không nhảy. */
function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={APPLICATION_TILE.size} height={APPLICATION_TILE.size} radius={APPLICATION_TILE.radius} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Skeleton width={92} height={22} radius={Radius.pill} />
          <Skeleton width={76} height={22} radius={Radius.pill} />
        </View>
        <Skeleton width="56%" height={16} />
        <Skeleton width="78%" height={12} />
        <Skeleton width="50%" height={24} />
        <Skeleton width="62%" height={12} />
        <Skeleton width="46%" height={12} />
        <Skeleton width={112} height={32} radius={Radius.pill} style={styles.button} />
      </View>
    </View>
  );
}

/** Trạng thái đang tải lần đầu của danh sách hồ sơ. */
export default function ApplicationListSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <View
      style={styles.list}
      accessibilityLiveRegion="polite"
      accessibilityLabel="Đang tải danh sách hồ sơ vay"
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
    gap: Spacing.lg,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  body: { flex: 1, gap: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  button: { alignSelf: 'flex-end' },
});
