import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { IconSize, MIN_TOUCH, Radius, Spacing, Text_, tabularNums } from '@/theme';
import type { SchedulePeriod } from '@/types/loan';
import { formatDate, formatDong } from '@/utils/format';

/**
 * Một kỳ trả trong danh sách dài. Bản cũ vẽ mỗi kỳ thành một thẻ đầy đủ sáu con
 * số nên 36 kỳ chiếm hết màn hình; ở đây mặc định chỉ hiện ba thông tin cần để
 * đối chiếu nhanh, phần tách gốc/lãi/phí bung ra khi người dùng cần.
 */
export default function SchedulePeriodRow({ period }: { period: SchedulePeriod }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen(value => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Kỳ ${period.period}, hạn ${formatDate(period.dueDate)}, ${formatDong(period.totalDue)}`}
        accessibilityHint="Mở để xem tách tiền gốc, lãi và phí"
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{period.period}</Text>
        </View>

        <View style={styles.dateBlock}>
          <Text style={styles.date}>{formatDate(period.dueDate)}</Text>
          <Text style={styles.span}>{period.daysInPeriod} ngày</Text>
        </View>

        <Text style={styles.amount} numberOfLines={1}>
          {formatDong(period.totalDue)}
        </Text>

        <Icon
          name={open ? 'chevronLeft' : 'chevronRight'}
          size={IconSize.xs}
          color={Colors.ink3}
        />
      </Pressable>

      {open ? (
        <View style={styles.detail}>
          <DetailLine label="Tiền gốc" value={formatDong(period.principal)} />
          <DetailLine label="Tiền lãi" value={formatDong(period.interest)} />
          <DetailLine label="Phí" value={formatDong(period.fees)} />
          <DetailLine label="Phạt dự kiến" value={formatDong(period.penalties)} />
          <DetailLine label="Dư nợ sau kỳ" value={formatDong(period.outstandingBalance)} emphasis />
          <Text style={styles.range}>
            Kỳ tính từ {formatDate(period.fromDate)} đến {formatDate(period.dueDate)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function DetailLine({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, emphasis && styles.detailValueStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: MIN_TOUCH + 8,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  pressed: { opacity: 0.7 },
  badge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { ...Text_.captionBold, color: Colors.brand, ...tabularNums },
  dateBlock: { flex: 1, gap: Spacing.xxs },
  date: { ...Text_.microBold, color: Colors.ink },
  span: { ...Text_.caption, color: Colors.ink3 },
  amount: { ...Text_.microBold, color: Colors.ink, textAlign: 'right', ...tabularNums },
  detail: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.surfaceSubtle,
  },
  detailLine: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.lg },
  detailLabel: { ...Text_.micro, color: Colors.ink2 },
  detailValue: { ...Text_.micro, color: Colors.ink, ...tabularNums },
  detailValueStrong: { ...Text_.microBold, color: Colors.ink, ...tabularNums },
  range: { ...Text_.caption, color: Colors.ink3, paddingTop: Spacing.xs },
});
