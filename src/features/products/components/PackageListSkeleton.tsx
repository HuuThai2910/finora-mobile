import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { PACKAGE_CARD_GAP, PACKAGE_TILE } from '../constant';

/** Thẻ giả cùng khung với `PackageCard`, để lúc dữ liệu về bố cục không nhảy. */
function CardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Skeleton width={PACKAGE_TILE.size} height={PACKAGE_TILE.size} radius={PACKAGE_TILE.radius} />
        <View style={styles.titleBlock}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={12} />
        </View>
        <Skeleton width={72} height={25} radius={Radius.pill} />
      </View>
      <View style={styles.facts}>
        {[0, 1, 2].map(index => (
          <View key={index} style={styles.fact}>
            <Skeleton width="70%" height={12} />
            <Skeleton width="85%" height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

/** Trạng thái đang tải lần đầu của danh sách gói vay ưu đãi. */
export default function PackageListSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <View style={styles.list} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải gói vay ưu đãi">
      {Array.from({ length: cards }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: PACKAGE_CARD_GAP },
  // Cùng lề, bo góc và bóng với `PackageCard`.
  card: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  titleBlock: { flex: 1, gap: 8 },
  facts: { flexDirection: 'row', gap: 10, marginTop: 18 },
  fact: { flex: 1, gap: 8 },
});
