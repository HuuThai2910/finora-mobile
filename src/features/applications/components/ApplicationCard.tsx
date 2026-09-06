import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_, tabularNums } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import type { LoanContractSummary } from '@/types/contract';
import { formatDate, formatDong } from '@/utils/format';
import { applicationJourneyStatus } from '../mappers/statusMeta';

type Props = {
  application: LoanApplication;
  contract?: LoanContractSummary;
  onPress: () => void;
};

/** Thẻ hồ sơ chỉ trình bày dữ liệu Loan Service trả về, không ghép fixture gọi vốn/servicing. */
export default function ApplicationCard({ application, contract, onPress }: Props) {
  const status = applicationJourneyStatus(application.status, contract?.status);
  const displayedRate = application.status === 'APPROVED'
    ? application.finalAnnualInterestRate ?? application.productSnapshot.annualInterestRate
    : application.productSnapshot.annualInterestRate;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Xem hồ sơ ${application.applicationNumber}, ${status.label}`}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.number} numberOfLines={1}>{application.applicationNumber}</Text>
          <Tag tone={status.tone} small>{status.label}</Tag>
        </View>
        <Text style={styles.amount}>{formatDong(application.requestedAmount)}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{application.requestedTermMonths} tháng</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{displayedRate}%/năm</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.submitted}>Nộp ngày {formatDate(application.submittedAt)}</Text>
          <Text style={styles.detail}>Xem chi tiết →</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.65 },
  card: { gap: Spacing.md, borderRadius: Radius.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  number: { ...Text_.microBold, color: Colors.brand, flexShrink: 1 },
  amount: { ...Text_.heading, color: Colors.ink, ...tabularNums },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  meta: { ...Text_.micro, color: Colors.ink2 },
  dot: { ...Text_.micro, color: Colors.ink3 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.line },
  submitted: { ...Text_.micro, color: Colors.ink3 },
  detail: { ...Text_.microBold, color: Colors.brand },
});
