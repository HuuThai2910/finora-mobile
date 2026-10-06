import { FlatList, StyleSheet, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { EmptyState, ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing } from '@/theme';
import { SchedulePeriodRow } from '@/features/applications';
import ServicingSummaryCard from '../components/ServicingSummaryCard';
import { useServicingLoan } from '../hooks/useLoanServicing';

type Route = RouteProp<ProfileStackParamList, 'ServicingSchedule'>;

export default function ServicingScheduleScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const state = useServicingLoan(loanNumber);
  if (state.loading && !state.data) return <Screen><PHeader title="Lịch trả nợ hiện tại" back /><LoadingScreen cards={5} /></Screen>;
  if (state.error || !state.data) return <Screen><PHeader title="Lịch trả nợ hiện tại" back /><ErrorState message={state.error ?? 'Không tải được lịch trả nợ.'} onRetry={state.reload} /></Screen>;
  return (
    <Screen scroll={false}>
      <PHeader title="Lịch trả nợ hiện tại" back hint={`${state.data.schedule.periods.length} kỳ`} />
      <FlatList
        data={state.data.schedule.periods}
        keyExtractor={item => String(item.period)}
        renderItem={({ item }) => <SchedulePeriodRow period={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={<View style={styles.header}><ServicingSummaryCard loan={state.data.loan} /></View>}
        ListEmptyComponent={<EmptyState icon="calendar" title="Chưa có lịch trả nợ" hint="Hãy làm mới sau khi Fineract hoàn tất cập nhật." />}
        contentContainerStyle={styles.content}
        refreshing={state.loading}
        onRefresh={state.reload}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: Spacing.section },
  header: { marginBottom: Spacing.xl },
  separator: { height: Spacing.md },
});
