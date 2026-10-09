import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { NOTIFICATION_GLYPH } from './NotificationCard';

/** Thẻ giả cùng khung với `NotificationCard`, để lúc dữ liệu về bố cục không nhảy. */
function CardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Skeleton width={NOTIFICATION_GLYPH} height={NOTIFICATION_GLYPH} radius={4} />
        <Skeleton width={76} height={12} />
        <Skeleton width={58} height={12} style={styles.time} />
      </View>
      <Skeleton width="94%" height={13} />
      <Skeleton width="58%" height={13} />
    </View>
  );
}

/** Trạng thái đang tải lần đầu: tiêu đề nhóm ngày và vài thẻ giả. */
export default function NotificationListSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <View style={styles.list} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải thông báo">
      <Skeleton width={84} height={14} style={styles.day} />
      {Array.from({ length: cards }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.md },
  day: { marginTop: Spacing.xs, marginBottom: Spacing.xs },
  card: {
    gap: 9,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  time: { marginLeft: 'auto' },
});
