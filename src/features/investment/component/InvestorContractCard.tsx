import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { InvestmentContract } from '@/types/invest';
import { formatDateTime, formatDong } from '@/utils/format';

type Props = {
  contract: InvestmentContract;
  onPress: () => void;
};

const statusOf = (contract: InvestmentContract): { label: string; bg: string; fg: string } => {
  if (contract.status === 'PENDING_SIGNATURE') {
    return { label: 'Chờ bạn ký', bg: Colors.amberBg, fg: Colors.tagAmberText };
  }
  if (contract.status === 'SIGNING') {
    return { label: 'Đang xác nhận SmartCA', bg: Colors.blueBg, fg: Colors.tagBlueText };
  }
  if (contract.status === 'DECLINED') {
    return { label: 'Đã hủy', bg: Colors.redBg, fg: Colors.tagRedText };
  }
  if (contract.status === 'EXPIRED') {
    return { label: 'Đã hết hạn ký', bg: Colors.grayBg, fg: Colors.tagGrayText };
  }
  if (contract.contractStatus === 'EFFECTIVE') {
    return { label: 'Đang hiệu lực', bg: Colors.greenBg, fg: Colors.tagGreenText };
  }
  if (contract.contractStatus === 'COMPLETED') {
    return { label: 'Đã tất toán', bg: Colors.grayBg, fg: Colors.tagGrayText };
  }
  if (contract.contractStatus === 'PENDING_BORROWER_SIGNATURE') {
    return { label: 'Chờ người vay ký', bg: Colors.blueBg, fg: Colors.tagBlueText };
  }
  if (contract.contractStatus === 'PENDING_LENDER_SIGNATURES') {
    return { label: 'Chờ các nhà đầu tư còn lại', bg: Colors.blueBg, fg: Colors.tagBlueText };
  }
  return { label: 'Bạn đã ký', bg: Colors.greenBg, fg: Colors.tagGreenText };
};

/** Một hợp đồng trong lịch sử của nhà đầu tư; chỉ dùng mã nghiệp vụ công khai, không lộ danh tính người vay. */
export default function InvestorContractCard({ contract, onPress }: Props) {
  const status = statusOf(contract);
  const primaryReference = contract.loanNumber ?? contract.applicationNumber;
  const dateLine = contract.investorSignedAt
    ? `Bạn ký lúc ${formatDateTime(contract.investorSignedAt)}`
    : `Hạn ký ${formatDateTime(contract.expiresAt)}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${primaryReference}, hợp đồng ${contract.reference}, ${status.label}`}
      accessibilityHint="Mở hợp đồng và các tệp chữ ký"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={styles.icon}>
          <Icon name="file" size={20} color={Colors.authPrimary} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.reference} maxFontSizeMultiplier={1.35}>{primaryReference}</Text>
          <Text style={styles.contractNumber} numberOfLines={1} maxFontSizeMultiplier={1.35}>
            {`Hồ sơ ${contract.applicationNumber} · Hợp đồng ${contract.reference}`}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: status.bg }]}>
          <Text style={[styles.pillText, { color: status.fg }]} maxFontSizeMultiplier={1.3}>
            {status.label}
          </Text>
        </View>
      </View>

      <Text style={styles.purpose} numberOfLines={2} maxFontSizeMultiplier={1.4}>{contract.purpose}</Text>

      <View style={styles.facts}>
        <View style={styles.fact}>
          <Text style={styles.factLabel}>Phần vốn của bạn</Text>
          <Text style={styles.factValue}>{formatDong(contract.amount)}</Text>
        </View>
        <View style={styles.fact}>
          <Text style={styles.factLabel}>Kỳ hạn</Text>
          <Text style={styles.factValue}>{`${contract.termMonths} tháng`}</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.date} maxFontSizeMultiplier={1.35}>{dateLine}</Text>
        <View style={styles.open}>
          <Text style={styles.openText}>Xem hợp đồng</Text>
          <Icon name="chevronRight" size={18} color={Colors.authPrimary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.md, backgroundColor: Colors.card, ...SoftShadow.card },
  pressed: { opacity: 0.72 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.tintBlue },
  titleBlock: { flex: 1, minWidth: 0 },
  reference: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  contractNumber: { marginTop: 2, fontFamily: FontFamily.regular, fontSize: 11.5, lineHeight: 16, color: Colors.authMuted },
  pill: { maxWidth: 122, borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  pillText: { textAlign: 'center', fontFamily: FontFamily.semibold, fontSize: 11, lineHeight: 15 },
  purpose: { fontFamily: FontFamily.medium, fontSize: 14, lineHeight: 20, color: Colors.authInk },
  facts: { flexDirection: 'row', gap: Spacing.sm },
  fact: { flex: 1, padding: Spacing.md, borderRadius: Radius.sm, backgroundColor: Colors.scheduleTile },
  factLabel: { fontFamily: FontFamily.regular, fontSize: 11.5, lineHeight: 16, color: Colors.authMuted },
  factValue: { marginTop: 2, fontFamily: FontFamily.bold, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
  bottom: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  date: { flexShrink: 1, fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  open: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3 },
  openText: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18, color: Colors.authPrimary },
});
