import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { InfoNote, SectionLabel, Switch, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong } from '@/utils/format';
import { AUTO_INVEST_OFF_NOTE, AUTO_INVEST_ON_NOTE } from '../constant';
import { useAutoInvest, useAutoInvestMatches } from '../hook/useInvestment';

/** Màn 21 — cấu hình Auto-Invest. */
export default function AutoInvestScreen() {
  const config = useAutoInvest();
  const matches = useAutoInvestMatches();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  const loading = config.loading || matches.loading;
  const error = config.error ?? matches.error;
  const reload = () => {
    config.reload();
    matches.reload();
  };

  if (loading) return <Screen><LoadingScreen cards={2} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!config.data) return null;

  const c = config.data;
  const on = enabled ?? c.enabled;

  return (
    <Screen>
      <PHeader
        title="Auto-Invest"
        back
        right={<Switch value={on} onValueChange={setEnabled} label="Bật Auto-Invest" />}
      />

      <InfoNote tone={on ? 'success' : 'info'} style={styles.status}>
        {on ? AUTO_INVEST_ON_NOTE : AUTO_INVEST_OFF_NOTE}
      </InfoNote>

      <SectionLabel>Tiêu chí chiến lược #1</SectionLabel>
      <PItem label="Nhóm điểm" value={c.grades.join(', ')} />
      <PItem label="Lãi suất tối thiểu" value={`≥ ${c.minAnnualRate}%/năm`} />
      <PItem label="Kỳ hạn tối đa" value={`${c.maxTermMonths} tháng`} />
      <PItem label="Mỗi khoản" value={formatDong(c.amountPerLoan)} />
      <PItem label="Trần danh mục/khoản" value={`${c.maxPortfolioSharePercent}%`} last />

      <SectionLabel style={styles.section}>Khớp gần nhất</SectionLabel>
      {matches.data?.map((m, i) => (
        <PItem
          key={`${m.at}-${m.loanId}`}
          label={
            <Text style={styles.match}>
              {m.at} · {m.loanId} ({m.grade} · {m.annualRate}%)
            </Text>
          }
          value={
            <Tag tone={m.matched ? 'green' : 'gray'} small>
              {m.matched && m.amount ? `Khớp ${formatDong(m.amount)}` : 'Bỏ qua'}
            </Tag>
          }
          last={i === (matches.data?.length ?? 0) - 1}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: { marginBottom: Spacing.xl },
  section: { marginTop: Spacing.xxl },
  match: { ...Text_.micro, color: Colors.ink3 },
});
