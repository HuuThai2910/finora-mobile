import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import { toLoanCardView } from '../mappers/servicing';
import type { ServicingLoanSummary } from '../types';
import LoanStatusPill from './LoanStatusPill';

type Props = {
  loan: ServicingLoanSummary;
  onPress: () => void;
};

/** Ô biểu tượng tròn như thẻ hợp đồng; khung giả lúc tải dùng cùng số đo. */
export const LOAN_TILE = 40;

/** Khoảng chừa bên phải cho mũi tên nằm giữa chiều cao thẻ. */
const CHEVRON_SPACE = 22;

/**
 * Thẻ một khoản vay ở màn "Khoản vay của tôi", cùng dáng thẻ "Hợp đồng của tôi": mã
 * khoản vay và nhãn trạng thái, dư nợ còn lại, số tiền vay | ngày đáo hạn, rồi nghĩa vụ
 * gần nhất (kỳ tới, hoặc khoản quá hạn tô đỏ như thẻ khoản vay ở danh mục đầu tư).
 * Cả thẻ là một nút mở chi tiết khoản vay.
 */
export default function LoanListCard({ loan, onPress }: Props) {
  const view = toLoanCardView(loan);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={view.accessibilityLabel}
      accessibilityHint="Mở chi tiết khoản vay"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.tile}>
        <Icon name="wallet" size={20} color={Colors.authPrimary} />
      </View>

      <View style={styles.body}>
        {/* Nhãn dài trên máy hẹp thì xuống dòng dưới mã, không cắt mã khoản vay. */}
        <View style={styles.topRow}>
          <Text style={styles.number} maxFontSizeMultiplier={1.4}>
            {view.loanNumber}
          </Text>
          <LoanStatusPill status={view.status} />
        </View>

        <View style={styles.details}>
          <View style={styles.amountRow}>
            <Text style={styles.amount} maxFontSizeMultiplier={1.4}>
              {view.outstanding}
            </Text>
            <Text style={styles.amountLabel} maxFontSizeMultiplier={1.4}>
              dư nợ còn lại
            </Text>
          </View>
          {/* Không kẻ vạch giữa hai mục như thẻ hợp đồng: dòng này dài hơn, máy 360pt phải
              xuống dòng và vạch sẽ lơ lửng cuối dòng; khoảng cách cùng icon đã tách hai mục. */}
          <View style={styles.metaRow}>
            <Meta icon="coins" text={view.principal} />
            <Meta icon="calendarCheck" text={view.maturity} />
          </View>
        </View>

        {view.due?.overdue ? (
          <View style={styles.overdue}>
            <Icon name="clockAlert" size={16} color={Colors.red} />
            <Text style={styles.overdueText} maxFontSizeMultiplier={1.4}>
              {view.due.label}
            </Text>
            <Text style={styles.overdueAmount} maxFontSizeMultiplier={1.4}>
              {view.due.amount}
            </Text>
          </View>
        ) : view.due ? (
          <View style={styles.dueRow}>
            <Meta icon="calendarClock" text={view.due.label} />
            <Text style={styles.dueAmount} maxFontSizeMultiplier={1.4}>
              {view.due.amount}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chevron}>
        <Icon name="chevronRight" size={20} color={Colors.chevronMuted} />
      </View>
    </Pressable>
  );
}

function Meta({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={14} color={Colors.authMuted} />
      <Text style={styles.metaText} maxFontSizeMultiplier={1.4}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.72 },
  tile: {
    width: LOAN_TILE,
    height: LOAN_TILE,
    borderRadius: LOAN_TILE / 2,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: Spacing.xs,
    rowGap: Spacing.xs,
  },
  // 12pt như mã hợp đồng: mã 23 ký tự vừa cùng hàng nhãn "Đang trả nợ" ở 393pt.
  number: {
    flexShrink: 1,
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.authPrimary,
  },
  details: { marginTop: Spacing.xs, paddingRight: CHEVRON_SPACE },
  amountRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: Spacing.sm },
  amount: {
    fontFamily: FontFamily.bold,
    fontSize: 21,
    lineHeight: 29,
    color: Colors.authInk,
    ...tabularNums,
  },
  amountLabel: { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 14,
    rowGap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  meta: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: {
    flexShrink: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.authMuted,
    ...tabularNums,
  },
  dueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: Spacing.sm,
    rowGap: Spacing.xs,
    marginTop: Spacing.md,
    // Đường kẻ và số tiền dừng trước cột mũi tên, thẳng mép phải với hộp quá hạn.
    marginRight: CHEVRON_SPACE,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.authBorder,
  },
  dueAmount: {
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.authInk,
    ...tabularNums,
  },
  // Khoản quá hạn: hộp đỏ nhạt như cảnh báo quá hạn ở thẻ danh mục đầu tư, chữ kèm icon.
  overdue: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: Spacing.sm,
    rowGap: Spacing.xs,
    marginTop: Spacing.md,
    marginRight: CHEVRON_SPACE,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.redBg,
  },
  overdueText: {
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: FontFamily.semibold,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.tagRedText,
  },
  overdueAmount: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.tagRedText,
    ...tabularNums,
  },
  chevron: { position: 'absolute', top: 0, bottom: 0, right: 10, justifyContent: 'center' },
});
