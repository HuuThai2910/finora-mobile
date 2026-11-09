import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { LoanContractSummary } from '@/types/contract';
import { toContractCardView } from '../mappers/contractCard';
import ApplicationStatusPill from './ApplicationStatusPill';

type Props = {
  contract: LoanContractSummary;
  onPress: () => void;
};

/** Ô biểu tượng tròn theo mockup; khung giả lúc tải dùng cùng số đo. */
export const CONTRACT_TILE = 40;

/** Khoảng chừa bên phải cho mũi tên nằm giữa chiều cao thẻ. */
const CHEVRON_SPACE = 22;

/**
 * Thẻ một hợp đồng ở màn "Hợp đồng của tôi" (mockup 26/09/2026): mục đích vay và
 * nhãn trạng thái, mã hợp đồng `HĐ-…` ở dòng phụ, số tiền vay, kỳ hạn | lãi suất, rồi dòng ngày. Cả thẻ là một
 * nút mở chi tiết hợp đồng; "Xem hợp đồng" chỉ là gợi ý thị giác bên trong nút đó.
 */
export default function ContractListCard({ contract, onPress }: Props) {
  const view = toContractCardView(contract);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={view.accessibilityLabel}
      accessibilityHint="Mở chi tiết hợp đồng"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.tile}>
        <Icon name="fileText" size={20} color={Colors.authPrimary} />
      </View>

      <View style={styles.body}>
        {/* Nhãn dài ("Đang chờ SmartCA") trên máy hẹp thì xuống dòng, không cắt tiêu đề. */}
        <View style={styles.topRow}>
          <Text style={styles.title} maxFontSizeMultiplier={1.4}>
            {view.title}
          </Text>
          <ApplicationStatusPill status={view.status} />
        </View>
        {view.codeLine ? (
          <Text style={styles.number} selectable maxFontSizeMultiplier={1.4}>
            {view.codeLine}
          </Text>
        ) : null}

        <View style={styles.details}>
          <Text style={styles.amount} maxFontSizeMultiplier={1.4}>
            {view.amount}
          </Text>
          <View style={styles.metaRow}>
            <Meta icon="clock" text={view.term} />
            <View style={styles.metaDivider} />
            <Meta icon="percent" text={view.rate} />
          </View>
        </View>

        {/* Mũi tên nằm giữa thẻ, cao hơn hàng này, nên hàng cuối dùng trọn bề ngang. */}
        <View style={styles.bottomRow}>
          <Meta icon="calendar" text={view.dateLine} />
          <View style={styles.link}>
            <Text style={styles.linkText} maxFontSizeMultiplier={1.4}>
              Xem hợp đồng
            </Text>
            <Icon name="arrowRight" size={15} color={Colors.authPrimary} strokeWidth={2.2} />
          </View>
        </View>
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
    // Lề ngang 12pt (dọc 14pt) để mã hợp đồng và nhãn trạng thái chung một hàng ở 393pt.
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.72 },
  tile: {
    width: CONTRACT_TILE,
    height: CONTRACT_TILE,
    borderRadius: CONTRACT_TILE / 2,
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
  title: {
    flexShrink: 1,
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authInk,
  },
  // Mã hiển thị 16 ký tự ở dòng phụ, cỡ 12pt như mã cũ.
  number: {
    marginTop: 2,
    flexShrink: 1,
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.authPrimary,
  },
  details: { marginTop: Spacing.xs, paddingRight: CHEVRON_SPACE },
  amount: {
    fontFamily: FontFamily.bold,
    fontSize: 21,
    lineHeight: 29,
    color: Colors.authInk,
    ...tabularNums,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: Spacing.sm },
  metaDivider: { width: StyleSheet.hairlineWidth, height: 14, backgroundColor: Colors.authBorder },
  meta: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: {
    flexShrink: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.authMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: Spacing.sm,
    rowGap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  link: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3 },
  linkText: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18, color: Colors.authPrimary },
  chevron: { position: 'absolute', top: 0, bottom: 0, right: 10, justifyContent: 'center' },
});
