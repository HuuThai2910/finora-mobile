import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import { formatDong, formatRecentTime } from '@/utils/format';
import type { PendingLoanActivation, PendingLoanActivationStatus } from '../types';

type Props = { activation: PendingLoanActivation };

const copy: Record<PendingLoanActivationStatus, { title: string; hint: string }> = {
  WAITING_PAYMENT: {
    title: 'Đang chuẩn bị giải ngân',
    hint: 'Hợp đồng đã có hiệu lực. FINORA đang chuyển tiền vào ví và chuẩn bị khoản vay của bạn.',
  },
  CORE_BOOKING_PENDING: {
    title: 'Đang tạo khoản vay và lịch trả nợ',
    hint: 'Tiền đã vào ví. FINORA đang hoàn tất khoản vay và lịch thanh toán; bạn chưa cần thao tác.',
  },
  CORE_BOOKING: {
    title: 'Đang tạo khoản vay và lịch trả nợ',
    hint: 'Tiền đã vào ví. FINORA đang hoàn tất khoản vay và lịch thanh toán; bạn chưa cần thao tác.',
  },
  RETRY_PENDING: {
    title: 'Đang hoàn tất lịch trả nợ',
    hint: 'Tiền đã vào ví. Kết nối đang tạm chậm và hệ thống sẽ tự thử lại; bạn không cần tạo lại hồ sơ.',
  },
  REPAIR_REQUIRED: {
    title: 'Cần hỗ trợ hoàn tất khoản vay',
    hint: 'Tiền đã giải ngân nhưng lịch trả nợ cần được FINORA kiểm tra. Không thanh toán hoặc tạo lại hồ sơ này.',
  },
};

/** Hiển thị khoảng chuyển tiếp sau giải ngân, tránh để người vay hiểu nhầm khoản vay bị mất. */
export default function PendingLoanActivationCard({ activation }: Props) {
  const content = copy[activation.status];
  const needsSupport = activation.status === 'REPAIR_REQUIRED';

  return (
    <View style={[styles.card, needsSupport && styles.supportCard]}>
      <View style={[styles.tile, needsSupport && styles.supportTile]}>
        <Icon name={needsSupport ? 'clockAlert' : 'wallet'} size={20} color={needsSupport ? Colors.amber : Colors.authPrimary} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} maxFontSizeMultiplier={1.4}>{content.title}</Text>
          {!needsSupport ? <ActivityIndicator size="small" color={Colors.authPrimary} /> : null}
        </View>
        <Text style={styles.amount} maxFontSizeMultiplier={1.4}>{formatDong(activation.principalAmount)}</Text>
        <Text style={styles.number} maxFontSizeMultiplier={1.4}>Hồ sơ {activation.applicationNumber}</Text>
        <Text style={styles.number} maxFontSizeMultiplier={1.4}>Hợp đồng {activation.contractNumber}</Text>
        <Text style={styles.hint} maxFontSizeMultiplier={1.4}>{content.hint}</Text>
        <Text style={styles.updated} maxFontSizeMultiplier={1.4}>Cập nhật {formatRecentTime(activation.updatedAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.tagBlueBorder,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  supportCard: { borderColor: Colors.tagAmberBorder },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tintBlue,
  },
  supportTile: { backgroundColor: Colors.amberBg },
  body: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  title: { flex: 1, fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  amount: { marginTop: Spacing.xs, fontFamily: FontFamily.bold, fontSize: 20, lineHeight: 28, color: Colors.authInk, ...tabularNums },
  number: { marginTop: 2, fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  hint: { marginTop: Spacing.sm, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authLabel },
  updated: { marginTop: Spacing.sm, fontFamily: FontFamily.regular, fontSize: 11.5, lineHeight: 17, color: Colors.ink3 },
});
