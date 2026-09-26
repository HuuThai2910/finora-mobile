import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import {
  FontFamily,
  FontSize,
  IconSize,
  LineHeight,
  MIN_TOUCH,
  Radius,
  SoftShadow,
  Spacing,
  lh,
  tabularNums,
} from '@/theme';
import { Icon } from '@/components/ui';
import type { SchedulePeriod } from '@/types/loan';
import { toSchedulePeriodView } from '../mappers/repaymentSchedule';
import SchedulePartTile from './SchedulePartTile';

type Props = {
  period: SchedulePeriod;
  expanded: boolean;
  /** Nhận số kỳ để màn giữ một hàm cố định cho cả danh sách (thẻ được memo). */
  onToggle: (period: number) => void;
};

/**
 * Thẻ một kỳ trong lịch trả dự kiến. Đầu thẻ luôn hiện số kỳ, số tiền phải trả và
 * khoảng ngày của kỳ; bấm vào đầu thẻ để mở/thu phần tách gốc, lãi, phí, phạt dự
 * kiến và dư nợ sau kỳ. Số liệu lấy nguyên từ preview, chỉ định dạng.
 *
 * Mockup đặt chip ngày cùng hàng với "Kỳ 1"; với cỡ chữ đọc được trên máy thật
 * thì ba thứ không vừa một hàng ở 360–393pt, nên chip nằm hàng thứ hai.
 */
function SchedulePeriodCard({ period, expanded, onToggle }: Props) {
  const view = toSchedulePeriodView(period);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => onToggle(period.period)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        // react-native-web bỏ qua `accessibilityState`, chỉ đọc thuộc tính aria-*;
        // thiếu dòng này thì bản web không báo được thẻ đang mở hay đóng.
        aria-expanded={expanded}
        accessibilityLabel={`${view.title}, ${view.spokenRange}, phải trả ${view.totalDue}`}
        accessibilityHint={
          expanded ? 'Thu gọn chi tiết của kỳ' : 'Mở để xem tiền gốc, tiền lãi, phí và dư nợ sau kỳ'
        }
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{view.title}</Text>
          <Text style={styles.amount}>{view.totalDue}</Text>
          <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={IconSize.xs} color={Colors.ink3} />
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{view.range}</Text>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <View style={styles.grid}>
            {view.parts.map(part => (
              <SchedulePartTile key={part.key} part={part} />
            ))}
          </View>
          <View style={styles.balance} accessible accessibilityLabel={`Dư nợ sau kỳ: ${view.balance}`}>
            <Text style={styles.balanceLabel}>Dư nợ sau kỳ</Text>
            <Text style={styles.balanceValue}>{view.balance}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Lịch có thể tới 60 kỳ; mỗi lần mở/thu một thẻ, FlatList vẽ lại mọi ô đang gắn
 * (do `extraData` đổi). Memo để chỉ thẻ vừa bấm vẽ lại — `period` là object của
 * preview nên giữ nguyên tham chiếu giữa các lần vẽ.
 */
export default memo(SchedulePeriodCard);

const styles = StyleSheet.create({
  // Lề trong 12pt như mockup: lưới 2×2 cần từng pt bề ngang ở máy 360pt.
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    ...SoftShadow.card,
  },
  head: {
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  pressed: { opacity: 0.6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.title,
    lineHeight: lh(FontSize.title, LineHeight.heading),
    color: Colors.authInk,
  },
  // Đẩy số tiền về sát mũi tên; tiền dài hoặc chữ phóng to thì xuống dòng trong phần còn lại.
  amount: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.authPrimary,
    ...tabularNums,
  },
  chip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.scheduleTile,
  },
  chipText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.4),
    color: Colors.authMuted,
    ...tabularNums,
  },
  body: { gap: Spacing.md, paddingTop: Spacing.xs, paddingBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    paddingTop: Spacing.md + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rowDivider,
  },
  balanceLabel: {
    flexShrink: 1,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authMuted,
  },
  balanceValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FontFamily.bold,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authInk,
    ...tabularNums,
  },
});
