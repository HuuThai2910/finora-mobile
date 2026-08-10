import { StyleSheet, Text, View } from 'react-native';
import { Card, SectionLabel } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_, tabularNums } from '@/theme';
import type { SchedulePeriod } from '@/types/loan';
import { formatDate, formatDong } from '@/utils/format';

type Props = {
  periods?: SchedulePeriod[];
  title?: string;
};

/** Hiển thị toàn bộ snapshot từng kỳ do backend trả về; không tự tính lại tiền trên mobile. */
export default function RepaymentScheduleList({ periods, title = 'Lịch trả từng kỳ' }: Props) {
  const rows = periods ?? [];
  return (
    <View>
      <SectionLabel muted style={styles.heading}>{title}</SectionLabel>
      {rows.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Chưa nhận được lịch trả từng kỳ</Text>
          <Text style={styles.empty}>
            Hãy tải lại sau khi Loan Service đã được cập nhật. Các số “kỳ đầu” và “kỳ cao nhất” phía trên chỉ là số liệu tóm tắt, không thay thế lịch đầy đủ.
          </Text>
        </View>
      ) : rows.map((period) => (
        <Card key={period.period} style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.period}>Kỳ {period.period}</Text>
              <Text style={styles.date}>{formatDate(period.fromDate)} → {formatDate(period.dueDate)} · {period.daysInPeriod} ngày</Text>
            </View>
            <Text style={styles.total}>{formatDong(period.totalDue)}</Text>
          </View>
          <View style={styles.grid}>
            <ScheduleValue label="Tiền gốc" value={formatDong(period.principal)} />
            <ScheduleValue label="Tiền lãi" value={formatDong(period.interest)} />
            <ScheduleValue label="Phí" value={formatDong(period.fees)} />
            <ScheduleValue label="Phạt dự kiến" value={formatDong(period.penalties)} />
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Dư nợ sau kỳ</Text>
            <Text style={styles.balance}>{formatDong(period.outstandingBalance)}</Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

function ScheduleValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.valueCell}>
      <Text style={styles.valueLabel}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: Spacing.xxl },
  emptyBox: { gap: Spacing.sm, padding: Spacing.xl, borderRadius: Radius.lg, backgroundColor: Colors.warnBg, borderWidth: 1, borderColor: Colors.warnBorder },
  emptyTitle: { ...Text_.microBold, color: Colors.warnText, textAlign: 'center' },
  empty: { ...Text_.micro, color: Colors.warnText, textAlign: 'center', lineHeight: 20 },
  card: { gap: Spacing.lg, marginBottom: Spacing.lg, borderRadius: Radius.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.lg },
  period: { ...Text_.bodyBold, color: Colors.ink },
  date: { ...Text_.caption, color: Colors.ink3, marginTop: Spacing.xs },
  total: { ...Text_.bodyBold, color: Colors.brand, textAlign: 'right', ...tabularNums },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  valueCell: { flexGrow: 1, flexBasis: '47%', padding: Spacing.md, backgroundColor: Colors.surfaceMuted, borderRadius: Radius.md },
  valueLabel: { ...Text_.caption, color: Colors.ink3 },
  value: { ...Text_.microBold, color: Colors.ink, marginTop: Spacing.xs, ...tabularNums },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.line },
  balanceLabel: { ...Text_.micro, color: Colors.ink2 },
  balance: { ...Text_.microBold, color: Colors.ink, ...tabularNums },
});
