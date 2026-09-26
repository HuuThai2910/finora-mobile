import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import type { LoanContractSummary } from '@/types/contract';
import { toApplicationCardView } from '../mappers/applicationCard';
import ApplicationStatusPill from './ApplicationStatusPill';

type Props = {
  application: LoanApplication;
  contract?: LoanContractSummary;
  onPress: () => void;
};

/** Ô biểu tượng theo mockup 393pt; khung giả lúc tải dùng cùng số đo. */
export const APPLICATION_TILE = { size: 52, radius: 14 } as const;

/** Khoảng chừa bên phải cho mũi tên nằm giữa chiều cao thẻ. */
const CHEVRON_SPACE = 22;

/**
 * Thẻ một hồ sơ vay, chỉ trình bày dữ liệu Loan Service trả về (không ghép
 * fixture gọi vốn/servicing). Cả thẻ là một nút duy nhất mở chi tiết hồ sơ;
 * "Xem chi tiết" chỉ là gợi ý thị giác bên trong nút đó, không phải điểm dừng
 * thứ hai của trình đọc màn hình.
 */
export default function ApplicationCard({ application, contract, onPress }: Props) {
  const view = toApplicationCardView(application, contract);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={view.accessibilityLabel}
      accessibilityHint="Mở chi tiết hồ sơ"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.tile}>
        <Icon name={view.icon} size={26} color={Colors.authPrimary} />
      </View>

      <View style={styles.body}>
        {/* Mục đích dài + nhãn trạng thái dài thì nhãn xuống dòng, không bị cắt chữ. */}
        <View style={styles.topRow}>
          <View style={styles.purpose}>
            <Text style={styles.purposeText} maxFontSizeMultiplier={1.4}>
              {view.purposeLabel}
            </Text>
          </View>
          <ApplicationStatusPill status={view.status} />
        </View>

        <View style={styles.details}>
          <Text style={styles.name}>{view.productName}</Text>
          <Text style={styles.number} numberOfLines={1} ellipsizeMode="middle">
            {view.applicationNumber}
          </Text>
          <Text style={styles.amount}>{view.amount}</Text>
          <View style={styles.metaRow}>
            <Meta icon="clock" text={view.term} />
            <Meta icon="percent" text={view.rate} />
          </View>
          <Meta icon="calendar" text={`Nộp ngày ${view.submittedOn}`} style={styles.submitted} />
        </View>

        <View style={styles.detailButton}>
          <Text style={styles.detailText}>Xem chi tiết</Text>
          <Icon name="arrowRight" size={15} color={Colors.authPrimary} strokeWidth={2.2} />
        </View>
      </View>

      <View style={styles.chevron}>
        <Icon name="chevronRight" size={20} color={Colors.chevronMuted} />
      </View>
    </Pressable>
  );
}

function Meta({ icon, text, style }: { icon: IconName; text: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.meta, style]}>
      <Icon name={icon} size={14} color={Colors.authMuted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.72 },
  tile: {
    width: APPLICATION_TILE.size,
    height: APPLICATION_TILE.size,
    borderRadius: APPLICATION_TILE.radius,
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
    gap: Spacing.sm,
  },
  purpose: {
    flexShrink: 1,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authNoteBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  purposeText: {
    fontFamily: FontFamily.semibold,
    fontSize: 10.5,
    lineHeight: 16,
    color: Colors.authPrimary,
  },
  details: { marginTop: Spacing.md, paddingRight: CHEVRON_SPACE },
  name: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 22, color: Colors.authInk },
  number: {
    marginTop: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.authMuted,
  },
  amount: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.bold,
    fontSize: 22,
    lineHeight: 30,
    color: Colors.authInk,
    ...tabularNums,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: {
    flexShrink: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.authMuted,
  },
  submitted: { marginTop: Spacing.xs },
  detailButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authNoteBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 7,
  },
  detailText: {
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.authPrimary,
  },
  chevron: { position: 'absolute', top: 0, bottom: 0, right: 10, justifyContent: 'center' },
});
