import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { TopUpOrder } from '@/types/wallet';
import { formatDong, formatTime } from '@/utils/format';
import { formatCountdown, providerLabel, topUpPaymentHint, topUpStatusView, type TopUpTone } from '../mappers/topUp';
import PaymentQr from './PaymentQr';

type Props = {
  order: TopUpOrder;
  /** Giây còn lại tới hạn thanh toán; `null` khi backend không trả hạn. */
  secondsLeft: number | null;
};

/** Cạnh tối đa của mã QR: đủ to để máy khác quét từ màn hình, vẫn chừa chỗ cho nút bên dưới. */
const QR_SIZE = 196;

const TONE_COLORS: Record<TopUpTone, { bg: string; fg: string }> = {
  blue: { bg: Colors.blueBg, fg: Colors.tagBlueText },
  amber: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  green: { bg: Colors.greenBg, fg: Colors.tagGreenText },
  red: { bg: Colors.redBg, fg: Colors.tagRedText },
  gray: { bg: Colors.grayBg, fg: Colors.tagGrayText },
};

/**
 * Thẻ thanh toán của lệnh đang chờ: trạng thái và cổng thanh toán, số tiền, mã QR thật của lệnh,
 * hướng dẫn và thời gian còn lại. Hết giờ chỉ đổi dòng đếm lùi; trạng thái lệnh vẫn theo backend.
 */
export default function TopUpPaymentCard({ order, secondsLeft }: Props) {
  const status = topUpStatusView(order.status);
  const tone = TONE_COLORS[status.tone];
  const expired = secondsLeft === 0;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.pill, { backgroundColor: tone.bg }]}>
          <Text style={[styles.pillText, { color: tone.fg }]} maxFontSizeMultiplier={1.4}>{status.label}</Text>
        </View>
        <Text style={styles.provider} numberOfLines={1} maxFontSizeMultiplier={1.4}>
          {providerLabel(order.provider)}
        </Text>
      </View>

      <Text style={styles.label} maxFontSizeMultiplier={1.4}>Số tiền nạp</Text>
      <Text style={styles.amount} maxFontSizeMultiplier={1.3}>{formatDong(order.amount)}</Text>

      <View style={styles.payBlock}>
        {order.qrPayload ? (
          <View style={[styles.qrFrame, expired && styles.qrExpired]}>
            <PaymentQr payload={order.qrPayload} size={QR_SIZE} />
          </View>
        ) : null}
        <Text style={styles.hint} maxFontSizeMultiplier={1.4}>{topUpPaymentHint(order, expired)}</Text>

        {secondsLeft !== null && order.expiresAt ? (
          <View style={styles.deadline} accessible accessibilityLiveRegion={expired ? 'polite' : 'none'}>
            <Icon name={expired ? 'clockAlert' : 'clock'} size={16} color={expired ? Colors.tagRedText : Colors.tagAmberText} />
            <Text style={[styles.deadlineText, expired && styles.deadlineExpired]} maxFontSizeMultiplier={1.4}>
              {expired
                ? `Đã quá hạn thanh toán lúc ${formatTime(order.expiresAt)}`
                : `Hết hạn sau ${formatCountdown(secondsLeft)}`}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17 },
  provider: { flex: 1, textAlign: 'right', fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  label: { marginTop: Spacing.lg, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  amount: {
    marginTop: 2,
    fontFamily: FontFamily.extrabold,
    fontSize: 26,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: Colors.authInk,
    ...tabularNums,
  },
  payBlock: {
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.rowDivider,
  },
  qrFrame: {
    padding: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.card,
  },
  // Quá hạn thì làm mờ mã để không ai quét một mã đã hết hiệu lực.
  qrExpired: { opacity: 0.25 },
  hint: { textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  deadline: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  deadlineText: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18, color: Colors.tagAmberText, ...tabularNums },
  deadlineExpired: { color: Colors.tagRedText },
});
