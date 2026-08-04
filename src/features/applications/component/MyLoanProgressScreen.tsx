import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_, tabularNums } from '@/theme';
import { PHeader, PItem, Screen, StepList } from '@/components/phone';
import { ProgressBar, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong, formatVND } from '@/utils/format';
import type { ProfileStackParamList } from '@/navigation/types';
import { FUNDING_FAIL_NOTE } from '../constant';
import { useLoanProgress, useProgressSteps } from '../hook/useApplications';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'MyLoanProgress'>;

/** Màn 16 — theo dõi trạng thái duyệt và gọi vốn (luồng A2.2–A2.3). */
export default function MyLoanProgressScreen() {
  const nav = useNavigation<Nav>();
  const progress = useLoanProgress();
  const steps = useProgressSteps();

  const loading = progress.loading || steps.loading;
  const error = progress.error ?? steps.error;
  const reload = () => {
    progress.reload();
    steps.reload();
  };

  if (loading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!progress.data) return null;

  const p = progress.data;

  return (
    <Screen onRefresh={reload} refreshing={false}>
      <PHeader
        title={`Hồ sơ ${p.applicationId}`}
        back
        right={<Tag tone="blue" small>Đang gọi vốn</Tag>}
      />

      <View style={styles.hero}>
        <Text style={styles.amount}>{formatDong(p.amount)}</Text>
        <Text style={styles.meta}>
          {p.termMonths} tháng · {p.annualRate}%/năm · điểm {p.grade} ({p.score})
        </Text>
      </View>

      <View style={styles.progressHead}>
        <Text style={styles.progressLabel}>Đã gọi được</Text>
        <Text style={styles.progressValue}>
          {formatVND(p.raisedAmount)} · {p.fundedPercent}%
        </Text>
      </View>
      <ProgressBar percent={p.fundedPercent} label="Tiến độ gọi vốn" />

      <View style={styles.steps}>{steps.data ? <StepList steps={steps.data} /> : null}</View>

      <Text style={styles.note}>{FUNDING_FAIL_NOTE}</Text>

      <PItem
        label="Xem lịch trả nợ"
        icon="clock"
        onPress={() => nav.navigate('RepaymentSchedule')}
        last
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xl },
  amount: { ...Text_.figure, color: Colors.ink, ...tabularNums },
  meta: { ...Text_.micro, color: Colors.ink3 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  progressLabel: { ...Text_.micro, color: Colors.ink3 },
  progressValue: { ...Text_.microBold, color: Colors.ink },
  steps: { marginTop: Spacing.xxl },
  note: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginVertical: Spacing.xl },
});
