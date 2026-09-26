import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, lh, tabularNums } from '@/theme';
import { Icon } from '@/components/ui';
import type { SchedulePartView } from '../mappers/repaymentSchedule';
import { LOAN_STEP_DESIGN_WIDTH, LOAN_STEP_MAX_WIDTH } from '../constant';

/** Số đo ở màn 393pt của mockup: ô biểu tượng 28pt bo 8pt, nét icon 15pt. */
const ICON_TILE = { size: 28, radius: 8 } as const;
const ICON_SIZE = 15;
const PAD_LEFT = Spacing.md;
const PAD_RIGHT = Spacing.xs;
const ICON_GAP = Spacing.md;

/**
 * Một phần của kỳ trả (tiền gốc, tiền lãi, phí, phạt dự kiến) trong lưới 2×2 của
 * thẻ từng kỳ: ô biểu tượng xanh, nhãn nhạt, số tiền đậm.
 *
 * Ô chỉ rộng nửa thẻ nên số tiền 8 chữ số ("16.666.667 đ" — vay 100 triệu trong
 * 6 tháng) không vừa một dòng ở máy 360pt nếu giữ cỡ của mockup 393pt. Cả ô co
 * theo bề rộng cột (không phóng to quá cỡ mockup); chữ phóng to theo cài đặt máy
 * thì vẫn được xuống dòng, không bị cắt.
 */
export default function SchedulePartTile({ part }: { part: SchedulePartView }) {
  const { width } = useWindowDimensions();
  const unit = Math.min(Math.min(width, LOAN_STEP_MAX_WIDTH) / LOAN_STEP_DESIGN_WIDTH, 1);
  const iconTile = ICON_TILE.size * unit;

  return (
    <View
      style={[
        styles.tile,
        { gap: ICON_GAP * unit, paddingLeft: PAD_LEFT * unit, paddingRight: PAD_RIGHT * unit },
      ]}
      accessible
      accessibilityLabel={`${part.label}: ${part.value}`}
    >
      <View style={[styles.iconTile, { width: iconTile, height: iconTile, borderRadius: ICON_TILE.radius * unit }]}>
        <Icon name={part.icon} size={ICON_SIZE * unit} color={Colors.authPrimary} />
      </View>
      <View style={styles.text}>
        <Text style={styles.label}>{part.label}</Text>
        <Text
          style={[
            styles.value,
            { fontSize: FontSize.micro * unit, lineHeight: lh(FontSize.micro * unit, 1.4) },
          ]}
        >
          {part.value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Hai ô một hàng: 40% + giãn đều, phần còn lại là khoảng cách giữa hai ô.
  tile: {
    flexGrow: 1,
    flexBasis: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.scheduleTile,
  },
  iconTile: {
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0 },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.4),
    color: Colors.authMuted,
  },
  // Không giới hạn số dòng: số tiền dài hoặc chữ phóng to thì xuống dòng, không bị cắt.
  value: {
    fontFamily: FontFamily.bold,
    color: Colors.authInk,
    ...tabularNums,
  },
});
