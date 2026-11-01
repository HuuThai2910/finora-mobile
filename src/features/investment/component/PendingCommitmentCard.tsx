import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { InvestmentCommitment } from '@/types/invest';
import { formatDong } from '@/utils/format';

type Props = {
  commitment: InvestmentCommitment;
  cancelling: boolean;
  onCancel: () => void;
};

/** Phần vốn chưa thành Note; chỉ listing OPEN mới có nút rút riêng lệnh. */
export default function PendingCommitmentCard({ commitment, cancelling, onCancel }: Props) {
  const locked = commitment.listingStatus === 'FULLY_FUNDED';
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.icon}><Icon name="clock" size={20} color={Colors.authPrimary} /></View>
        <View style={styles.headText}>
          <Text style={styles.title}>Khoản vay #{commitment.listingId}</Text>
          <Text style={styles.meta}>{commitment.noteCount} Note · {commitment.sharePercent}% khoản vay</Text>
        </View>
        <Text style={styles.amount}>{formatDong(commitment.amount)}</Text>
      </View>

      <Text style={styles.hint}>
        {commitment.cancelAllowed
          ? 'Tiền đang được giữ tạm. Bạn có thể rút lệnh trước khi khoản vay gọi đủ vốn.'
          : locked
            ? 'Danh sách góp vốn đã khóa để ký hợp đồng. Nếu chưa ký, bạn có thể từ chối tại mục Ký hợp đồng.'
            : 'Phần vốn đang được hệ thống xử lý và không còn hủy trực tiếp tại đây.'}
      </Text>

      {commitment.cancelAllowed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Rút ${formatDong(commitment.amount)} khỏi khoản vay ${commitment.listingId}`}
          accessibilityState={{ disabled: cancelling, busy: cancelling }}
          disabled={cancelling}
          onPress={onCancel}
          style={({ pressed }) => [styles.cancel, pressed && styles.pressed, cancelling && styles.disabled]}
        >
          <Text style={styles.cancelText}>{cancelling ? 'Đang rút vốn…' : 'Rút lệnh góp vốn'}</Text>
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
  cancel: { minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.tagRedBorder, borderRadius: Radius.pill },
  cancelText: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.red },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },
});
