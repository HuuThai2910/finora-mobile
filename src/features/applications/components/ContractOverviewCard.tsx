import { StyleSheet, Text, View } from 'react-native';
import { Card, Icon, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { IconSize, Radius, Spacing, Text_, tabularNums } from '@/theme';
import type { LoanContractDetail } from '@/types/contract';
import { formatAnnualRate, formatDateTime, formatDong } from '@/utils/format';
import type { Countdown } from '../hook/useCountdown';
import { contractStatusMeta } from '../mappers/statusMeta';

type Props = {
  contract: LoanContractDetail;
  countdown: Countdown;
};

/**
 * Thẻ tổng quan duy nhất của Contract. Màn ngoài chỉ trả lời “đây là hợp đồng nào,
 * đang ở trạng thái gì và còn bao lâu”; tiền phải trả chi tiết nằm trong tài liệu.
 */
export default function ContractOverviewCard({ contract, countdown }: Props) {
  const status = contractStatusMeta(contract.status);
  const fact = statusFact(contract, countdown);

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text style={styles.eyebrow}>HỢP ĐỒNG VAY ĐIỆN TỬ</Text>
          <Text selectable style={styles.number}>{contract.contractNumber}</Text>
        </View>
        <Tag tone={status.tone} small>{status.label}</Tag>
      </View>

      <View style={styles.amountBlock}>
        <Text style={styles.amountLabel}>Số tiền vay</Text>
        <Text style={styles.amount} adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1}>
          {formatDong(contract.principalAmount)}
        </Text>
      </View>

      <View style={styles.terms}>
        <Term label="Thời hạn" value={`${contract.termMonths} tháng`} />
        <View style={styles.termDivider} />
        <Term label="Lãi suất áp dụng" value={formatAnnualRate(contract.annualInterestRate)} />
      </View>

      {fact ? (
        <View style={[styles.fact, fact.urgent && styles.factUrgent]}>
          <View style={styles.factIcon}>
            <Icon name={fact.icon} size={IconSize.xs} color={fact.urgent ? Colors.amber : Colors.cyanBright} />
          </View>
          <View style={styles.factCopy}>
            <Text style={[styles.factLabel, fact.urgent && styles.factLabelUrgent]}>{fact.label}</Text>
            <Text style={[styles.factValue, fact.urgent && styles.factValueUrgent]}>{fact.value}</Text>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.term}>
      <Text style={styles.termLabel}>{label}</Text>
      <Text style={styles.termValue}>{value}</Text>
    </View>
  );
}

type StatusFact = { label: string; value: string; icon: IconName; urgent: boolean };

function statusFact(contract: LoanContractDetail, countdown: Countdown): StatusFact | null {
  switch (contract.status) {
    case 'PENDING_SIGNATURE':
      return countdown.expired
        ? { label: 'Hạn xác nhận', value: 'Đã hết hạn', icon: 'alert', urgent: true }
        : {
            label: 'Hạn xác nhận',
            value: countdown.label || `đến ${formatDateTime(contract.expiresAt)}`,
            icon: 'clock',
            urgent: countdown.urgent,
          };
    case 'SIGNED':
      return contract.signedAt
        ? { label: 'Đã ký lúc', value: formatDateTime(contract.signedAt), icon: 'check', urgent: false }
        : null;
    case 'EFFECTIVE':
      return contract.effectiveAt
        ? { label: 'Có hiệu lực từ', value: formatDateTime(contract.effectiveAt), icon: 'shield', urgent: false }
        : null;
    case 'DECLINED':
      return contract.declinedAt
        ? { label: 'Đã từ chối lúc', value: formatDateTime(contract.declinedAt), icon: 'x', urgent: false }
        : null;
    case 'EXPIRED':
      return { label: 'Hạn xác nhận', value: 'Đã hết hạn', icon: 'clock', urgent: true };
    case 'COMPLETED':
      return { label: 'Tình trạng', value: 'Khoản vay đã hoàn tất', icon: 'check', urgent: false };
  }
}

const styles = StyleSheet.create({
  card: { gap: Spacing.xl, backgroundColor: Colors.navy, borderColor: Colors.navy },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md },
  identity: { flex: 1, gap: Spacing.xxs },
  eyebrow: { ...Text_.captionBold, color: Colors.cyanBright, letterSpacing: 0.7 },
  number: { ...Text_.caption, color: Colors.onDarkMuted },
  amountBlock: { gap: Spacing.xs },
  amountLabel: { ...Text_.caption, color: Colors.onDarkMuted },
  amount: { ...Text_.figure, color: Colors.onDark, ...tabularNums },
  terms: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.onDarkFaint,
  },
  term: { flex: 1, gap: Spacing.xs },
  termDivider: { width: 1, backgroundColor: Colors.onDarkFaint, marginHorizontal: Spacing.lg },
  termLabel: { ...Text_.caption, color: Colors.onDarkMuted },
  termValue: { ...Text_.bodyBold, color: Colors.onDark, ...tabularNums },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.onDarkFaint,
  },
  factUrgent: { backgroundColor: Colors.amberBg },
  factIcon: { width: 28, alignItems: 'center' },
  factCopy: { flex: 1, gap: Spacing.xxs },
  factLabel: { ...Text_.caption, color: Colors.onDarkMuted },
  factValue: { ...Text_.microBold, color: Colors.onDark },
  factLabelUrgent: { color: Colors.tagAmberText },
  factValueUrgent: { color: Colors.tagAmberText },
});
