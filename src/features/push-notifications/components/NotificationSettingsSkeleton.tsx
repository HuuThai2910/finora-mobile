import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { Skeleton } from '@/components/feedback';

/** Số dòng giả bằng số nhóm hay gặp nhất trên màn thật để nội dung không nhảy nhiều khi dữ liệu về. */
const ROWS = 5;

/**
 * Khung giả lúc tải tùy chọn thông báo lần đầu: cùng khung thẻ, ô icon 40pt và nhịp dòng với thẻ "Nhận thông báo đẩy
 * theo nhóm", kể cả chỗ của công tắc bên phải.
 */
export default function NotificationSettingsSkeleton() {
  return (
    <View style={styles.card} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải cài đặt thông báo">
      <View style={styles.header}>
        <Skeleton width={20} height={20} radius={Radius.sm} />
        <Skeleton height={16} width="56%" />
      </View>
      {Array.from({ length: ROWS }, (_, index) => (
        <View key={index} style={styles.row}>
          <Skeleton width={40} height={40} radius={Radius.sm} />
          <View style={[styles.body, index > 0 && styles.divider]}>
            <View style={styles.text}>
              <Skeleton height={14} width="48%" />
              <Skeleton height={12} width="82%" />
            </View>
            <Skeleton width={44} height={26} radius={Radius.pill} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    ...SoftShadow.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center' },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginLeft: Spacing.lg,
    paddingVertical: 14,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.rowDivider },
  text: { flex: 1, gap: Spacing.sm },
});
