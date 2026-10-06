import { StyleSheet, Text, View } from 'react-native';
import { Card, InfoNote, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Spacing, Text_, tabularNums } from '@/theme';
import { formatDong, formatLocalDate } from '@/utils/format';
import { servicingStatusLabel, servicingStatusTone } from '../mappers/servicing';
import type { ServicingLoanSummary } from '../types';
import FinancialRows from './FinancialRows';

export default function ServicingSummaryCard({ loan }: { loan: ServicingLoanSummary }) {
  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <Text style={styles.eyebrow}>DƯ NỢ HIỆN TẠI</Text>
            <Text style={styles.amount}>{formatDong(loan.totalOutstanding)}</Text>
            <Text style={styles.number}>{loan.loanNumber}</Text>
          </View>
          <Tag tone={servicingStatusTone(loan.status)} small>{servicingStatusLabel(loan.status)}</Tag>
        </View>
        <FinancialRows rows={[
          { label: 'Gốc còn lại', value: loan.principalOutstanding },
          { label: 'Khoản quá hạn', value: loan.overdueAmount },
          { label: 'Kỳ thanh toán tiếp theo', value: loan.nextDueDate ? formatLocalDate(loan.nextDueDate) : '—' },
          { label: 'Số tiền kỳ tới', value: loan.nextDueAmount, emphasis: true },
          { label: 'Ngày đáo hạn', value: formatLocalDate(loan.maturityDate) },
        ]} />
      </Card>
      {loan.stale ? (
        <InfoNote tone="warn">Dữ liệu đang chờ đồng bộ lại từ Fineract. Hãy làm mới trước khi thanh toán.</InfoNote>
      ) : null}
      {loan.daysPastDue > 0 ? (
        <InfoNote tone="warn">Khoản vay đã quá hạn {loan.daysPastDue} ngày. Thanh toán sẽ được ghi nhận là khắc phục quá hạn.</InfoNote>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.lg },
  card: { gap: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.lg },
  identity: { flex: 1 },
  eyebrow: { ...Text_.sectionLabel, color: Colors.authMuted },
  amount: { ...Text_.figure, color: Colors.authInk, marginTop: Spacing.xs, ...tabularNums },
  number: { ...Text_.caption, color: Colors.authMuted, marginTop: Spacing.xs },
});

