import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';
import type { BookOrder } from '@/types/orderBook';
import { formatDong } from '@/utils/format';
import { CANCEL_REASON_LABEL, ORDER_DONE_MASCOT, SIDE_LABEL } from '../constant';
import { formatBookPrice } from '../format';

type Props = {
  order: BookOrder;
  onBackToBook: () => void;
  onPlaceAnother: () => void;
};

/** Một câu nói đúng điều vừa xảy ra với lệnh, theo trạng thái backend trả về. */
function headlineOf(order: BookOrder): { title: string; detail: string; ok: boolean } {
  const verb = SIDE_LABEL[order.side].toLowerCase();
  switch (order.status) {
    case 'FILLED':
      return { title: `Đã ${verb} xong ${order.quantity} Note`, detail: 'Note đã đổi chủ ngay lúc khớp; tiền được thanh toán tự động sau đó.', ok: true };
    case 'PARTIALLY_FILLED':
      return {
        title: `Đã khớp ${order.filled}/${order.quantity} Note`,
        detail: `${order.remaining} Note còn lại nằm trong sổ ở giá ${formatBookPrice(order.price)}, chờ người ${order.side === 'BID' ? 'bán' : 'mua'}.`,
        ok: true,
      };
    case 'OPEN':
      return {
        title: 'Lệnh đã vào sổ',
        detail: `Đang chờ người ${order.side === 'BID' ? 'bán' : 'mua'} ở giá ${formatBookPrice(order.price)}. Bạn có thể huỷ bất cứ lúc nào trước khi khớp.`,
        ok: true,
      };
    case 'CANCELLED':
      return { title: 'Lệnh không vào sổ', detail: CANCEL_REASON_LABEL[order.cancelReason ?? 'UNKNOWN'], ok: false };
    case 'REJECTED':
      return { title: 'Lệnh bị từ chối', detail: order.rejectReason ?? 'Ví không giữ được tiền cho lệnh này.', ok: false };
    default:
      return { title: 'Đã gửi lệnh', detail: 'Mở "Lệnh của tôi" để xem trạng thái mới nhất.', ok: true };
  }
}

/**
 * Màn kết quả sau khi đặt lệnh: robot cầm đồng xu chào khi lệnh vào sổ hoặc khớp, kèm câu nói rõ
 * lệnh đang ở đâu. Lệnh mua hiện thêm số tiền đang giữ để người dùng hiểu số dư vừa giảm.
 */
export default function OrderResult({ order, onBackToBook, onPlaceAnother }: Props) {
  const { title, detail, ok } = headlineOf(order);
  const held = order.side === 'BID' && order.holdAmount != null && ok ? order.holdAmount - (order.holdConsumed ?? 0) : null;

  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      {ok ? (
        <Image
          source={ORDER_DONE_MASCOT}
          resizeMode="contain"
          style={styles.mascot}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      ) : null}
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
      {held !== null && held > 0 ? (
        <Text style={styles.held}>{`Đang giữ ${formatDong(held)} trong ví cho phần chưa khớp.`}</Text>
      ) : null}

      <Pressable
        onPress={onBackToBook}
        accessibilityRole="button"
        accessibilityLabel="Về sổ lệnh"
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <Text style={styles.primaryText}>Về sổ lệnh</Text>
      </Pressable>
      <Pressable
        onPress={onPlaceAnother}
        accessibilityRole="button"
        accessibilityLabel="Đặt lệnh khác"
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryText}>Đặt lệnh khác</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  // Ảnh robot 480×510 đã cắt sát; giữ đúng tỉ lệ.
  mascot: { width: 132, height: 140, marginBottom: Spacing.sm },
  title: { fontFamily: FontFamily.extrabold, fontSize: 20, lineHeight: 29, color: Colors.authInk, textAlign: 'center' },
  detail: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 21, color: Colors.authMuted, textAlign: 'center' },
  held: { fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.authInk, textAlign: 'center' },
  primary: {
    alignSelf: 'stretch',
    minHeight: 48,
    marginTop: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 22, color: Colors.onDark },
  secondary: { minHeight: MIN_TOUCH, paddingHorizontal: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authPrimary },
  pressed: { opacity: 0.75 },
});
