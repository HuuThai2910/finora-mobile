import { StyleSheet, Text, View } from 'react-native';
import { Card, InfoNote, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { formatDong, formatLocalDate } from '@/utils/format';
import { isHeldUntilDueDate, repaymentStatusLabel, repaymentStatusTone } from '../mappers/servicing';
import type { RepaymentResult } from '../types';
import FinancialRows, { type FinancialRow } from './FinancialRows';

export default function RepaymentResultCard({ result }: { result: RepaymentResult }) {
  // Trả kỳ trước hạn (D16): tiền đã rời ví, sổ nợ ghi nhận đúng ngày đến hạn nên chưa có phân bổ gốc/lãi.
  const held = isHeldUntilDueDate(result) && result.postOn ? result.postOn : null;
  const terminal = result.status === 'COMPLETED' || held !== null;
  const message = held
    ? `Đã trừ ${formatDong(result.amount)} từ ví. Khoản tiền được ghi nhận vào kỳ đúng ngày đến hạn ${formatLocalDate(held)}, `
      + 'nên lãi của kỳ giữ nguyên theo lịch và bạn không cần thanh toán thêm cho kỳ này. Trước ngày đó bạn có thể hủy để nhận lại tiền.'
    : result.status === 'COMPLETED'
      ? 'Tiền đã được ghi nhận vào khoản vay và chuyển cho nhà đầu tư. Lịch trả nợ sẽ được cập nhật tự động.'
      : result.status === 'CANCELLED'
        ? 'Đã hủy khoản thanh toán chờ ghi nhận; tiền đã hoàn về ví. Kỳ này vẫn cần được thanh toán trước ngày đến hạn.'
        : result.status === 'FAILED'
          ? 'Giao dịch chưa hoàn tất. Vui lòng kiểm tra thông tin bên dưới trước khi thử lại.'
          : result.status === 'RECONCILIATION_REQUIRED'
            ? 'Hệ thống đang kiểm tra kết quả giao dịch. Không thanh toán lại để tránh trùng giao dịch.'
            : 'Đã nhận tiền. Hệ thống đang cập nhật khoản vay và chuyển tiền cho nhà đầu tư. Trạng thái sẽ tự cập nhật trong ít giây.';
  const rows: FinancialRow[] = held
    ? [
        { label: 'Số tiền đã thu', value: result.amount, emphasis: true },
        { label: 'Ngày thu từ ví', value: formatLocalDate(result.transactionDate) },
        { label: 'Ghi nhận vào khoản vay', value: formatLocalDate(held) },
      ]
    : [
        { label: 'Số tiền đã thu', value: result.amount, emphasis: true },
        { label: 'Vào gốc', value: result.principalAmount ?? 0 },
        { label: 'Vào lãi', value: result.interestAmount ?? 0 },
        { label: 'Phí và phạt', value: (result.feeAmount ?? 0) + (result.penaltyAmount ?? 0) },
        { label: 'Dư nợ sau giao dịch', value: result.totalOutstanding ?? 'Đang cập nhật' },
        { label: 'Kỳ tới', value: result.nextDueDate ? formatLocalDate(result.nextDueDate) : '—' },
      ];
  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Kết quả giao dịch</Text>
          <Tag tone={held ? 'blue' : repaymentStatusTone(result.status)} small>
            {held ? `Chờ ghi nhận ${formatLocalDate(held)}` : repaymentStatusLabel(result.status)}
          </Tag>
        </View>
        <FinancialRows rows={rows} />
        <Text style={styles.reference}>Mã giao dịch: {result.repaymentId}</Text>
        {result.errorCode && result.status !== 'CANCELLED' ? <Text style={styles.errorCode}>Mã hỗ trợ: {result.errorCode}</Text> : null}
      </Card>
      <InfoNote tone={terminal ? 'success' : 'warn'}>
        {message}
      </InfoNote>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.lg },
  card: { gap: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg },
  title: { ...Text_.title, color: Colors.authInk, flex: 1 },
  reference: { ...Text_.caption, color: Colors.authMuted },
  errorCode: { ...Text_.captionBold, color: Colors.red },
});
