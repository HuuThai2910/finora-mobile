import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, InfoNote, ProgressBar, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong } from '@/utils/format';
import type { ProfileStackParamList, TabParamList } from '@/navigation/types';
import { DECLINING_NOTE, PERIOD_STATUS } from '../constant';
import { useRepaymentSchedule } from '../hook/useApplications';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'RepaymentSchedule'>,
  BottomTabNavigationProp<TabParamList>
>;

/** Màn 17 — lịch trả nợ đầy đủ (luồng A2.5). */
export default function RepaymentScheduleScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, error, reload } = useRepaymentSchedule();

  if (loading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return null;

  const { summary, rows } = data;
  const nextDue = rows.find(r => r.status === 'DUE_SOON');

  return (
    <Screen>
      <PHeader
        title="Lịch trả nợ"
        back
        hint={`${summary.loanId} · ${summary.paidPeriods}/${summary.totalPeriods} kỳ`}
      />

      <ProgressBar
        percent={(summary.paidPeriods / summary.totalPeriods) * 100}
        label="Tiến độ trả nợ"
        style={styles.bar}
      />

      {rows.map((r, i) => (
        <PItem
          key={r.period}
          label={
            <Text style={styles.period}>
              <Text style={styles.periodStrong}>Kỳ {r.period}</Text> · {r.dueDate}
            </Text>
          }
          value={
            <View style={styles.value}>
              <Text style={styles.amount}>{formatDong(r.amount)}</Text>
              <Tag tone={PERIOD_STATUS[r.status].tone} small>
                {PERIOD_STATUS[r.status].label}
              </Tag>
            </View>
          }
          last={i === rows.length - 1}
        />
      ))}

      <InfoNote style={styles.note}>
        {DECLINING_NOTE(formatDong(summary.outstandingPrincipal))}
      </InfoNote>

      {nextDue ? (
        <Button
          label={`Thanh toán kỳ ${nextDue.period}`}
          variant="emerald"
          onPress={() => nav.navigate('Ví', { screen: 'PayInstallment' })}
          style={styles.action}
        />
      ) : null}

      <PItem
        label="Tất toán sớm / Tái cơ cấu"
        icon="clock"
        onPress={() => nav.navigate('Hồ sơ', { screen: 'EarlySettlement' })}
        last
        style={styles.link}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { marginBottom: Spacing.xl },
  period: { ...Text_.body, color: Colors.ink },
  periodStrong: { ...Text_.bodyBold, color: Colors.ink },
  value: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  amount: { ...Text_.microBold, color: Colors.ink },
  note: { marginTop: Spacing.xl },
  action: { marginTop: Spacing.xl },
  link: { marginTop: Spacing.md },
});
