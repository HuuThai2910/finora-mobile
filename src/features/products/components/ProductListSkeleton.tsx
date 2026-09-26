import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { Skeleton } from '@/components/feedback';
import { PRODUCT_CARD_GAP, PRODUCT_CARD_TILE, PRODUCT_ROW_TILE } from '../constant';

/** Thẻ giả cùng khung với `ProductCard` (ô icon, tên, bốn dòng) để lúc dữ liệu về không nhảy bố cục. */
function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Skeleton
          width={PRODUCT_CARD_TILE.size}
          height={PRODUCT_CARD_TILE.size}
          radius={PRODUCT_CARD_TILE.radius}
        />
        <View style={styles.titles}>
          <Skeleton height={16} width="62%" />
          <Skeleton height={12} width="84%" />
        </View>
      </View>
      {[0, 1, 2, 3].map(row => (
        <View key={row} style={styles.row}>
          <Skeleton
            width={PRODUCT_ROW_TILE.size}
            height={PRODUCT_ROW_TILE.size}
            radius={PRODUCT_ROW_TILE.radius}
          />
          <Skeleton height={14} width="32%" />
          <View style={styles.spacer} />
          <Skeleton height={14} width="28%" />
        </View>
      ))}
    </View>
  );
}

/** Trạng thái đang tải của danh sách sản phẩm. */
export default function ProductListSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <View style={styles.list} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải sản phẩm vay">
      {Array.from({ length: cards }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: PRODUCT_CARD_GAP },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    gap: Spacing.lg,
    ...SoftShadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.xs },
  titles: { flex: 1, gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, minHeight: 34 },
  spacer: { flex: 1 },
});
