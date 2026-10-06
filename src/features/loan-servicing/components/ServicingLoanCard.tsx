import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Icon, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing, Text_, tabularNums } from '@/theme';
import { formatDong, formatLocalDate } from '@/utils/format';
import { servicingStatusLabel, servicingStatusTone } from '../mappers/servicing';
import type { ServicingLoanSummary } from '../types';

export default function ServicingLoanCard({ loan, onPress }: { loan: ServicingLoanSummary; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Khoản vay ${loan.loanNumber}, dư nợ ${formatDong(loan.totalOutstanding)}`}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.icon}><Icon name="fileText" size={IconSize.sm} color={Colors.authPrimary} /></View>
          <View style={styles.identity}>
            <Text style={styles.number}>{loan.loanNumber}</Text>
            <Text style={styles.contract}>{loan.contractNumber}</Text>
          </View>
          <Tag tone={servicingStatusTone(loan.status)} small>{servicingStatusLabel(loan.status)}</Tag>
        </View>
        <View style={styles.amountRow}>
          <View><Text style={styles.label}>Dư nợ còn lại</Text><Text style={styles.amount}>{formatDong(loan.totalOutstanding)}</Text></View>
          <Icon name="chevronRight" size={IconSize.xs} color={Colors.chevronMuted} />
        </View>
        {loan.overdueAmount > 0 ? (
          <Text style={styles.overdue}>Quá hạn {loan.daysPastDue} ngày · {formatDong(loan.overdueAmount)}</Text>
        ) : (
          <Text style={styles.due}>Kỳ tới {loan.nextDueDate ? formatLocalDate(loan.nextDueDate) : '—'} · {formatDong(loan.nextDueAmount)}</Text>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.72 },
  card: { gap: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.tintBlue, alignItems: 'center', justifyContent: 'center' },
  identity: { flex: 1, minWidth: 0 },
  number: { ...Text_.microBold, color: Colors.authInk },
  contract: { ...Text_.caption, color: Colors.authMuted, marginTop: 2 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg },
  label: { ...Text_.caption, color: Colors.authMuted },
  amount: { ...Text_.heading, color: Colors.authInk, marginTop: Spacing.xs, ...tabularNums },
  overdue: { ...Text_.captionBold, color: Colors.red },
  due: { ...Text_.caption, color: Colors.authMuted },
});

