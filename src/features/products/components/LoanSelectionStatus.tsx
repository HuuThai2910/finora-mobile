import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';
import { ErrorState, Skeleton } from '@/components/feedback';

type Props = {
  /** Có lỗi thì hiện thẻ lỗi kèm nút thử lại; không thì đang tải. */
  error: string | null;
  onRetry: () => void;
};

/** Khung giả cùng bố cục với nội dung thật (tên, thẻ điều khoản, hai bộ chọn) để lúc dữ liệu về không nhảy. */
function LoanSelectionSkeleton() {
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải sản phẩm vay">
      <View style={styles.intro}>
        <Skeleton height={12} width="28%" />
        <Skeleton height={22} width="64%" />
        <Skeleton height={20} width="32%" radius={Radius.pill} />
      </View>

      <View style={styles.card}>
        {[0, 1].map(row => (
          <View key={row} style={styles.cardRow}>
            {[0, 1].map(cell => (
              <View key={cell} style={styles.cell}>
                <Skeleton height={12} width="70%" />
                <Skeleton height={16} width="55%" />
              </View>
            ))}
          </View>
        ))}
      </View>

      {[0, 1].map(section => (
        <View key={section} style={styles.section}>
          <Skeleton height={16} width="38%" />
          <Skeleton height={MIN_TOUCH + Spacing.md + 2} radius={Radius.md} />
          <Skeleton height={36} radius={Radius.pill} />
        </View>
      ))}
    </View>
  );
}

/**
 * Nội dung thay chỗ bước 1 khi chưa có Product: đang tải hoặc lỗi. Lỗi nằm trong
 * thẻ trắng để không chìm vào nền sóng; đầu màn (có nút quay lại) vẫn giữ nguyên.
 */
export default function LoanSelectionStatus({ error, onRetry }: Props) {
  if (!error) return <LoanSelectionSkeleton />;

  return (
    <View style={[styles.card, styles.errorCard]} accessibilityLiveRegion="polite">
      <ErrorState message={error} onRetry={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xxxl },
  intro: { gap: Spacing.md, marginTop: Spacing.lg },
  card: {
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  cardRow: { flexDirection: 'row', gap: Spacing.section, paddingVertical: Spacing.lg },
  cell: { flex: 1, gap: Spacing.sm },
  section: { gap: Spacing.md },
  errorCard: { marginTop: Spacing.xl },
});
