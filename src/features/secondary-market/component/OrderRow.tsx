import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, Spacing, tabularNums } from '@/theme';
import type { BookOrder } from '@/types/orderBook';
import { formatDong } from '@/utils/format';
import { CANCEL_REASON_LABEL, SIDE_LABEL, STATUS_LABEL, STATUS_TONE } from '../constant';
import { formatBookPrice } from '../format';

type Props = {
  order: BookOrder;
  /** Hiện mã khoản vay khi danh sách gồm lệnh của nhiều sổ. */
  loanLabel?: string;
  onCancel?: (reference: string) => void;
  cancelling?: boolean;
  /** Bỏ đường kẻ trên cho dòng đầu tiên trong thẻ. */
  first?: boolean;
};

/** Chỉ phần chưa khớp của lệnh đang nằm trong sổ mới huỷ được. */
const isCancellable = (order: BookOrder) => order.status === 'OPEN' || order.status === 'PARTIALLY_FILLED';

/**
 * Một lệnh của tôi: chiều, giá, tiến độ khớp, trạng thái và nút huỷ. Lệnh mua hiện thêm số tiền
 * đang giữ để người dùng biết vì sao số dư khả dụng giảm.
 */
export default function OrderRow({ order, loanLabel, onCancel, cancelling = false, first = false }: Props) {
  const buy = order.side === 'BID';
  const progress = `Đã khớp ${order.filled}/${order.quantity} Note`;
  const detail = detailOf(order);

  return (
    <View style={[styles.row, !first && styles.divider]}>
      <View style={styles.main}>
        <View style={styles.headline}>
          <View style={[styles.side, { backgroundColor: buy ? Colors.bookBid : Colors.bookAsk }]}>
            <Text style={styles.sideText} maxFontSizeMultiplier={1.3}>{SIDE_LABEL[order.side]}</Text>
          </View>
          <Text style={styles.price} maxFontSizeMultiplier={1.3}>{formatBookPrice(order.price)}</Text>
          {loanLabel ? <Text style={styles.loan} maxFontSizeMultiplier={1.3}>{loanLabel}</Text> : null}
        </View>
        <Text style={styles.progress} maxFontSizeMultiplier={1.4}>{progress}</Text>
        {detail ? <Text style={styles.detail} maxFontSizeMultiplier={1.4}>{detail}</Text> : null}
        <Tag tone={STATUS_TONE[order.status]} small style={styles.status}>
          {STATUS_LABEL[order.status]}
        </Tag>
      </View>

      {onCancel && isCancellable(order) ? (
        <Pressable
          onPress={() => onCancel(order.reference)}
          disabled={cancelling}
          accessibilityRole="button"
          accessibilityLabel={`Huỷ phần chưa khớp của lệnh ${SIDE_LABEL[order.side].toLowerCase()} giá ${formatBookPrice(order.price)}`}
          accessibilityState={{ disabled: cancelling, busy: cancelling }}
          style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
        >
          {cancelling ? (
            <ActivityIndicator size="small" color={Colors.bookAsk} />
          ) : (
            <Text style={styles.cancelText}>Huỷ</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

function detailOf(order: BookOrder): string | null {
  if (order.status === 'REJECTED') return order.rejectReason ?? 'Ví không giữ được tiền cho lệnh này.';
  if (order.status === 'CANCELLED' && order.cancelReason) return CANCEL_REASON_LABEL[order.cancelReason];
  if (order.side === 'BID' && order.holdAmount != null && !order.holdReleased) {
    return `Đang giữ ${formatDong(order.holdAmount - (order.holdConsumed ?? 0))} trong ví`;
  }
  return null;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  main: { flex: 1, minWidth: 0, gap: 3 },
  headline: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  side: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  sideText: { fontFamily: FontFamily.bold, fontSize: 12, lineHeight: 17, color: Colors.onDark },
  price: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 22, color: Colors.authInk, ...tabularNums },
  loan: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  progress: { fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.authLabel, ...tabularNums },
  detail: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  status: { alignSelf: 'flex-start', marginTop: 2 },
  cancel: {
    minWidth: 64,
    minHeight: MIN_TOUCH - 8,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.bookAsk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  cancelText: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.bookAsk },
});
