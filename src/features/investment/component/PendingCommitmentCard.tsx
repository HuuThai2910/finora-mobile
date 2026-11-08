import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { InvestmentCommitment, InvestmentContract } from '@/types/invest';
import { formatDong } from '@/utils/format';

type Props = {
  commitment: InvestmentCommitment;
  contract: InvestmentContract | null;
  cancelling: boolean;
  onCancel: () => void;
  onViewContract: (contractNumber: string) => void;
};

/**
 * Phần vốn chưa thành Note; chỉ listing OPEN mới có nút rút riêng lệnh. Listing mở lại để gọi vốn bổ sung (một nhà
 * đầu tư khác rút trước khi ký) thì phần vốn đã nằm trong hợp đồng không rút được qua lệnh.
 */
export default function PendingCommitmentCard({ commitment, contract, cancelling, onCancel, onViewContract }: Props) {
  const locked = commitment.listingStatus === 'FULLY_FUNDED';
  const refunding = commitment.listingStatus === 'OPEN' && !commitment.cancelAllowed && contract != null;
  const stage = commitment.cancelAllowed
    ? 'Đang gọi vốn'
    : locked
      ? 'Chờ hoàn tất hợp đồng'
      : refunding
        ? 'Đang gọi vốn bổ sung'
        : 'Đang hoàn tất đầu tư';
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.icon}><Icon name="clock" size={20} color={Colors.authPrimary} /></View>
        <View style={styles.headText}>
          <Text style={styles.title}>{contract?.applicationNumber ?? `Đợt gọi vốn #${commitment.listingId}`}</Text>
          <Text style={styles.meta}>{stage} · {commitment.noteCount} Note · {commitment.sharePercent}% khoản vay</Text>
        </View>
        <Text style={styles.amount}>{formatDong(commitment.amount)}</Text>
      </View>

      <Text style={styles.hint}>
        {commitment.cancelAllowed
          ? 'Tiền đang được giữ trong ví và có thể rút trước khi khoản vay đủ vốn.'
          : locked
            ? 'Khoản vay đã đủ vốn; tiền chỉ chuyển sau khi hợp đồng được ký đủ.'
            : refunding
              ? 'Một nhà đầu tư khác đã rút trước khi ký. Phần vốn của bạn được giữ nguyên trong lúc khoản vay tìm người góp thay.'
              : 'Khoản đầu tư đang hoàn tất trước khi phát hành Note.'}
      </Text>

      {contract ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Xem hợp đồng ${contract.reference}`}
          onPress={() => onViewContract(contract.reference)}
          style={({ pressed }) => [styles.contract, pressed && styles.pressed]}
        >
          <Text style={styles.contractText}>Xem hợp đồng {contract.reference}</Text>
          <Icon name="chevronRight" size={18} color={Colors.authPrimary} />
        </Pressable>
      ) : null}

      {commitment.cancelAllowed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Rút ${formatDong(commitment.amount)} khỏi khoản vay ${commitment.listingId}`}
          accessibilityState={{ disabled: cancelling, busy: cancelling }}
          disabled={cancelling}
          onPress={onCancel}
          style={({ pressed }) => [styles.cancel, pressed && styles.pressed, cancelling && styles.disabled]}
        >
          <Text style={styles.cancelText}>{cancelling ? 'Đang rút vốn…' : 'Rút vốn đang chờ'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.md, backgroundColor: Colors.card, ...SoftShadow.card },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.tintBlue },
  headText: { flex: 1, minWidth: 0 },
  title: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authInk },
  meta: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  amount: { fontFamily: FontFamily.bold, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
  hint: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  contract: { minHeight: MIN_TOUCH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  contractText: { flex: 1, fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 19, color: Colors.authPrimary },
  cancel: { minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.authBorder, borderRadius: Radius.pill },
  cancelText: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authPrimary },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },
});
