import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { Skeleton } from '@/components/feedback';

/** Thẻ tóm tắt giả: nhãn, số tiền lớn, hai dòng phụ, hai ô tổng và ba dòng. */
function SummarySkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={12} width="38%" />
      <Skeleton height={30} width="70%" style={styles.gapTop} />
      <Skeleton height={13} width="80%" style={styles.gapTop} />
      <Skeleton height={13} width="42%" />
      <View style={[styles.tiles, styles.gapTop]}>
        <Skeleton height={56} width="48%" radius={Radius.sm} />
        <Skeleton height={56} width="48%" radius={Radius.sm} />
      </View>
      {[0, 1, 2].map(row => (
        <View key={row} style={styles.row}>
          <Skeleton height={14} width="34%" />
          <Skeleton height={14} width="30%" />
        </View>
      ))}
    </View>
  );
}

/** Thẻ kỳ giả: "Kỳ n" + số tiền, chip ngày và lưới 2×2 (kỳ đầu mở sẵn nên có lưới). */
function PeriodSkeleton({ open }: { open: boolean }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Skeleton height={18} width="20%" />
        <Skeleton height={16} width="36%" />
      </View>
      <Skeleton height={20} width="72%" radius={Radius.pill} />
      {open ? (
        <View style={styles.tiles}>
          {[0, 1, 2, 3].map(tile => (
            <Skeleton key={tile} height={46} width="48%" radius={Radius.sm} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Trạng thái đang tải của bước 2/3: khung giả cùng bố cục với lời dẫn, thẻ tóm
 * tắt và hai thẻ kỳ đầu, để lúc lịch về trang không nhảy.
 */
export default function ScheduleSkeleton() {
  return (
    <View style={styles.list} accessibilityLiveRegion="polite" accessibilityLabel="Đang tính lịch trả dự kiến">
      <View style={styles.intro}>
        <Skeleton height={22} width="58%" />
        <Skeleton height={13} width="70%" />
      </View>
      <SummarySkeleton />
      <PeriodSkeleton open />
      <PeriodSkeleton open={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.lg },
  intro: { gap: Spacing.md, marginBottom: Spacing.xs },
  card: {
    gap: Spacing.md,
    padding: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  gapTop: { marginTop: Spacing.xs },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 28 },
});
