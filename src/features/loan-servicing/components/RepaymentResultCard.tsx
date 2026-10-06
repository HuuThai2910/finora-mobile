import { StyleSheet, Text, View } from 'react-native';
import { Card, InfoNote, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { formatDong, formatLocalDate } from '@/utils/format';
import { repaymentStatusLabel, repaymentStatusTone } from '../mappers/servicing';
import type { RepaymentResult } from '../types';
import FinancialRows from './FinancialRows';

export default function RepaymentResultCard({ result }: { result: RepaymentResult }) {
  const terminal = result.status === 'COMPLETED';
  const message = result.status === 'COMPLETED'
    ? 'Tiền đã được ghi nhận và phân phối. Lịch trả nợ sẽ được tải lại từ Fineract.'
    : result.status === 'FAILED'
      ? 'Giao dịch không hoàn tất. Kiểm tra mã lỗi bên dưới trước khi thử lại; hệ thống không được báo thành công khi core từ chối.'
      : result.status === 'RECONCILIATION_REQUIRED'
        ? 'Giao dịch cần quản trị viên đối soát. Không thanh toán lại để tránh trùng giao dịch.'
        : 'Tiền đã được tiếp nhận nhưng quy trình core chưa hoàn tất. Không thanh toán lại; hãy mở lại khoản vay để kiểm tra trạng thái.';
  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Kết quả giao dịch</Text>
          <Tag tone={repaymentStatusTone(result.status)} small>{repaymentStatusLabel(result.status)}</Tag>
        </View>
        <FinancialRows rows={[
          { label: 'Số tiền đã thu', value: result.amount, emphasis: true },
          { label: 'Vào gốc', value: result.principalAmount ?? 0 },
          { label: 'Vào lãi', value: result.interestAmount ?? 0 },
          { label: 'Phí và phạt', value: (result.feeAmount ?? 0) + (result.penaltyAmount ?? 0) },
          { label: 'Dư nợ sau giao dịch', value: result.totalOutstanding ?? 'Đang cập nhật' },
          { label: 'Kỳ tới', value: result.nextDueDate ? formatLocalDate(result.nextDueDate) : '—' },
        ]} />
        <Text style={styles.reference}>Mã giao dịch: {result.repaymentId}</Text>
        {result.errorCode ? <Text style={styles.errorCode}>Mã lỗi: {result.errorCode}</Text> : null}
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
