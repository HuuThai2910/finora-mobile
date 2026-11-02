import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { InvestmentContract } from '@/types/invest';
import { formatDateTime, formatDong } from '@/utils/format';

const STATUS: Record<InvestmentContract['status'], { label: string; bg: string; fg: string }> = {
  PENDING_SIGNATURE: { label: 'Chờ bạn ký', bg: Colors.amberBg, fg: Colors.tagAmberText },
  SIGNING: { label: 'Đang xác nhận SmartCA', bg: Colors.blueBg, fg: Colors.tagBlueText },
  SIGNED: { label: 'Bạn đã ký', bg: Colors.greenBg, fg: Colors.tagGreenText },
  DECLINED: { label: 'Hợp đồng đã hủy', bg: Colors.redBg, fg: Colors.tagRedText },
  EXPIRED: { label: 'Đã hết hạn ký', bg: Colors.grayBg, fg: Colors.tagGrayText },
};

/**
 * Tóm tắt hợp đồng đầu tư: phần vốn của bạn là con số lớn, bên dưới là mục đích, số Note, kỳ hạn,
 * hạn ký và còn bao nhiêu nhà đầu tư chưa ký.
 */
export default function ContractSummaryCard({ contract }: { contract: InvestmentContract }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const status = STATUS[contract.status];
  const details = [
    { label: 'Mã hồ sơ vay', value: contract.applicationNumber },
    ...(contract.loanNumber ? [{ label: 'Mã khoản vay', value: contract.loanNumber }] : []),
    { label: 'Số Note', value: String(contract.noteCount) },
    { label: 'Nhà đầu tư chưa ký', value: String(contract.remainingLenderSignatures) },
  ];
  const signingWindow = contract.status === 'PENDING_SIGNATURE' || contract.status === 'SIGNING';

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.pill, { backgroundColor: status.bg }]}>
          <Text style={[styles.pillText, { color: status.fg }]} maxFontSizeMultiplier={1.4}>{status.label}</Text>
        </View>
        <Text style={styles.reference} numberOfLines={1} maxFontSizeMultiplier={1.3}>{contract.reference}</Text>
      </View>

      <Text style={styles.label} maxFontSizeMultiplier={1.4}>Vốn của bạn trong hợp đồng</Text>
      <Text style={styles.amount} maxFontSizeMultiplier={1.3}>{formatDong(contract.amount)}</Text>

      <View style={styles.rows}>
        <SummaryRow label="Mục đích" value={contract.purpose} />
        <SummaryRow label="Kỳ hạn" value={`${contract.termMonths} tháng`} divided />
        {signingWindow ? <SummaryRow label="Hạn ký" value={formatDateTime(contract.expiresAt)} divided /> : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: detailsOpen }}
        accessibilityLabel={detailsOpen ? 'Thu gọn mã và thông tin đối chiếu' : 'Xem mã và thông tin đối chiếu'}
        onPress={() => setDetailsOpen(value => !value)}
        style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
      >
        <Text style={styles.detailsLabel}>Mã và thông tin đối chiếu</Text>
        <Icon name={detailsOpen ? 'chevronLeft' : 'chevronRight'} size={17} color={Colors.authPrimary} />
      </Pressable>

      {detailsOpen ? (
        <View style={styles.details}>
          {details.map((r, i) => <SummaryRow key={r.label} label={r.label} value={r.value} divided={i > 0} />)}
        </View>
      ) : null}
    </View>
  );
}

function SummaryRow({ label, value, divided = false }: { label: string; value: string; divided?: boolean }) {
  return (
    <View style={[styles.row, divided && styles.divider]}>
      <Text style={styles.rowLabel} maxFontSizeMultiplier={1.4}>{label}</Text>
      <Text style={styles.rowValue} maxFontSizeMultiplier={1.4}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17 },
  reference: { flex: 1, textAlign: 'right', fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  label: { marginTop: Spacing.lg, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  amount: { marginTop: 2, fontFamily: FontFamily.extrabold, fontSize: 26, lineHeight: 36, letterSpacing: -0.4, color: Colors.authInk, ...tabularNums },
  rows: { marginTop: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, minHeight: 44 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  rowLabel: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
  detailsButton: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.rowDivider,
  },
  detailsLabel: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 19, color: Colors.authPrimary },
  details: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  pressed: { opacity: 0.75 },
});
