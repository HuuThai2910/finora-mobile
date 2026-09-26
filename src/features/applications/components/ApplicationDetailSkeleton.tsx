import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';

const TERMS = [0, 1, 2] as const;

/**
 * Lần tải đầu của màn chi tiết: khung giả cùng dáng thẻ tóm tắt, thẻ thanh toán
 * và thẻ tiến trình, để lúc dữ liệu về bố cục không nhảy.
 */
export default function ApplicationDetailSkeleton() {
  return (
    <View
      style={styles.list}
      accessibilityLiveRegion="polite"
      accessibilityLabel="Đang tải chi tiết hồ sơ vay"
    >
      <View style={styles.card}>
        <View style={styles.spread}>
          <Skeleton width={110} height={22} radius={Radius.pill} />
          <Skeleton width={84} height={26} radius={Radius.pill} />
        </View>
        <Skeleton width="62%" height={32} />
        <View style={styles.spread}>
          {TERMS.map(item => (
            <View key={item} style={styles.term}>
              <Skeleton width={26} height={26} radius={8} />
              <View style={styles.termText}>
                <Skeleton width="80%" height={13} />
                <Skeleton width="60%" height={11} />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Skeleton width="48%" height={18} />
        <Skeleton width="56%" height={32} />
        <Skeleton width="78%" height={13} />
        <Skeleton height={44} radius={12} />
      </View>

      <View style={styles.card}>
        <Skeleton width="52%" height={18} />
        {TERMS.map(item => (
          <View key={item} style={styles.step}>
            <Skeleton width={22} height={22} radius={11} />
            <View style={styles.termText}>
              <Skeleton width="55%" height={14} />
              <Skeleton width="40%" height={11} />
            </View>
          </View>
        ))}
      </View>
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
  spread: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  term: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  termText: { flex: 1, gap: 6 },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
});
