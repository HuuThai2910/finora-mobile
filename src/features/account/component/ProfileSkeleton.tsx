import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { Skeleton } from '@/components/feedback';

/**
 * Khung giả lúc tải hồ sơ lần đầu, cùng bố cục với màn thật (đầu trang, ba lối
 * tắt, các thẻ cài đặt) để nội dung không nhảy chỗ khi dữ liệu về.
 */
export default function ProfileSkeleton() {
  return (
    <View style={styles.root} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải hồ sơ">
      <View style={styles.header}>
        <Skeleton width={56} height={56} radius={28} />
        <View style={styles.headerText}>
          <Skeleton height={16} width="70%" />
          <Skeleton height={18} width={110} radius={9} />
          <Skeleton height={12} width="55%" />
        </View>
      </View>

      <View style={styles.shortcuts}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.card, styles.shortcut]}>
            <Skeleton width={36} height={36} radius={10} />
            <Skeleton height={14} width="75%" />
            <Skeleton height={11} width="90%" />
          </View>
        ))}
      </View>

      {[0, 1].map(i => (
        <View key={i} style={[styles.card, styles.group]}>
          <Skeleton height={16} width="45%" />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ))}
    </View>
  );
}

function SkeletonRow() {
  return (
    <View style={styles.row}>
      <Skeleton width={40} height={40} radius={12} />
      <View style={styles.rowText}>
        <Skeleton height={14} width="60%" />
        <Skeleton height={12} width="35%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 100 },
  headerText: { flex: 1, gap: Spacing.md },
  shortcuts: { flexDirection: 'row', gap: Spacing.md },
  card: { backgroundColor: Colors.card, ...SoftShadow.card },
  shortcut: { flex: 1, borderRadius: 14, padding: Spacing.lg, gap: 10 },
  group: { borderRadius: Radius.md, padding: 14, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  rowText: { flex: 1, gap: Spacing.md },
});
