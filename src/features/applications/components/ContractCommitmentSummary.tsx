import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Spacing, Text_, tabularNums } from '@/theme';
import type { LoanContractDetail } from '@/types/contract';
import { formatAnnualRate, formatDate, formatDong } from '@/utils/format';
import { REPAYMENT_LABELS } from '../constant';

/**
 * Tóm tắt đúng những nghĩa vụ người vay sắp cam kết, viết thành câu ngắn thay
 * vì bảng số liệu. Đây là nội dung người dùng thực sự đọc trước khi tick đồng ý,
 * nên nó đứng riêng chứ không lẫn vào phần chi phí chi tiết ở màn đọc hợp đồng.
 */
export default function ContractCommitmentSummary({
  contract,
}: {
  contract: LoanContractDetail;
}) {
  const repaymentLabel = REPAYMENT_LABELS[contract.repaymentMethod] ?? contract.repaymentMethod;

  return (
    <Card style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        Bạn đang cam kết
      </Text>
      <Line label="Vay" value={formatDong(contract.principalAmount)} />
      <Line label="Trong" value={`${contract.termMonths} tháng`} />
      <Line label="Lãi suất cố định" value={formatAnnualRate(contract.annualInterestRate)} />
      <Line
        label="Mỗi kỳ trả"
        value={`${formatDong(contract.firstInstallment)} · ${repaymentLabel.toLowerCase()}`}
      />
      <Line label="Tổng phải trả" value={formatDong(contract.totalRepayment)} emphasis />
      <Line label="Giải ngân dự kiến" value={formatDate(contract.expectedDisbursementDate)} />
    </Card>
  );
}

function Line({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View style={styles.line}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, emphasis && styles.valueStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.lg },
  title: { ...Text_.title, color: Colors.ink },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.xl,
  },
  label: { ...Text_.micro, color: Colors.ink2, flexShrink: 0 },
  value: {
    ...Text_.microBold,
    color: Colors.ink,
    flexShrink: 1,
    textAlign: 'right',
    ...tabularNums,
  },
  valueStrong: { ...Text_.bodyBold, color: Colors.brand, ...tabularNums },
});
