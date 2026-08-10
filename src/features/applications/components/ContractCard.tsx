import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_, tabularNums } from '@/theme';
import type { LoanContractSummary } from '@/types/contract';
import { formatDate, formatDong } from '@/utils/format';
import { CONTRACT_STATUS } from '../constant';

type Props = {
  contract: LoanContractSummary;
  onPress: () => void;
};

/** Thẻ hợp đồng dùng public contractNumber và trạng thái thật từ Loan Service. */
export default function ContractCard({ contract, onPress }: Props) {
  const status = CONTRACT_STATUS[contract.status];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Xem hợp đồng ${contract.contractNumber}, ${status.label}`}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.number} numberOfLines={1}>{contract.contractNumber}</Text>
          <Tag tone={status.tone} small>{status.label}</Tag>
        </View>
        <Text style={styles.amount}>{formatDong(contract.principalAmount)}</Text>
        <Text style={styles.meta}>{contract.termMonths} tháng · {contract.annualInterestRate}%/năm</Text>
        <View style={styles.footer}>
          <Text style={styles.expiry}>Hạn xác nhận: {formatDate(contract.expiresAt)}</Text>
          <Text style={styles.detail}>Xem hợp đồng →</Text>
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
  meta: { ...Text_.micro, color: Colors.ink2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.line },
  expiry: { ...Text_.micro, color: Colors.ink3 },
  detail: { ...Text_.microBold, color: Colors.brand },
});
