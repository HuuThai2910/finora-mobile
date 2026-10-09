import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveBackdrop } from '@/components/phone';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { ApplicationDetailError, DetailNote } from '@/features/applications';
import { SchedulePeriodCard } from '@/features/products';
import type { ProfileStackParamList } from '@/navigation/types';
import { FontFamily, Spacing } from '@/theme';
import LoanDetailSkeleton from '../components/LoanDetailSkeleton';
import ScheduleOverviewCard from '../components/ScheduleOverviewCard';
import ServicingHeader from '../components/ServicingHeader';
import ServicingScaffold from '../components/ServicingScaffold';
import { SERVICING_BOTTOM_SPACE, SERVICING_MAX_WIDTH, SERVICING_PADDING } from '../constants';
import { useServicingLoan } from '../hooks/useLoanServicing';
import { nextPeriodOf } from '../mappers/servicing';

type Route = RouteProp<ProfileStackParamList, 'ServicingSchedule'>;

const TITLE = 'Lịch trả nợ';

/**
 * Lịch trả của khoản vay đang trả, cùng dáng thẻ kỳ với bước "Xác nhận khoản vay": thẻ
 * tổng quan rồi từng kỳ mở/thu được. Kỳ trùng ngày đến hạn kỳ tới được gắn nhãn và mở sẵn.
 * Một khoản vay có thể tới 60 kỳ nên dùng FlatList; nền sóng đứng yên phía sau danh sách.
 */
export default function ServicingScheduleScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const state = useServicingLoan(loanNumber);
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, SERVICING_MAX_WIDTH);

  // Những kỳ người dùng đã bấm đổi so với mặc định (kỳ tới mở, các kỳ khác thu gọn). Giữ ở
  // màn chứ không trong thẻ: FlatList gỡ thẻ đã cuộn xa, state trong thẻ sẽ mất.
  const [toggled, setToggled] = useState<ReadonlySet<number>>(() => new Set());
  // Một tham chiếu cho cả danh sách để thẻ kỳ (đã memo) không vẽ lại khi thẻ khác đổi.
  const togglePeriod = useCallback((period: number) => {
    setToggled(current => {
      const next = new Set(current);
      if (next.has(period)) next.delete(period);
      else next.add(period);
      return next;
    });
  }, []);

  if (state.loading && !state.data) {
    return (
      <ServicingScaffold title={TITLE} subtitle={loanNumber}>
        <LoanDetailSkeleton label="Đang tải lịch trả nợ" cards={1} />
      </ServicingScaffold>
    );
  }

  if (state.error || !state.data) {
    return (
      <ServicingScaffold title={TITLE} subtitle={loanNumber}>
        <ApplicationDetailError
          message={state.error ?? 'Không tải được lịch trả nợ.'}
          retrying={state.loading}
          onRetry={state.reload}
        />
      </ServicingScaffold>
    );
  }

  const { loan, schedule } = state.data;
  const periods = schedule.periods;
  const nextPeriod = nextPeriodOf(loan, periods);
  const openByDefault = nextPeriod ?? periods[0]?.period ?? null;

  return (
    <View style={styles.root}>
      <View style={[styles.column, { width }]}>
        <WaveBackdrop background={HOME_WAVES} width={width} />
        <FlatList
          style={styles.list}
          data={periods}
          keyExtractor={item => String(item.period)}
          renderItem={({ item }) => (
            <SchedulePeriodCard
              period={item}
              expanded={(item.period === openByDefault) !== toggled.has(item.period)}
              onToggle={togglePeriod}
              tag={item.period === nextPeriod ? 'Kỳ tới' : undefined}
            />
          )}
          extraData={toggled}
          ItemSeparatorComponent={CardGap}
          ListHeaderComponent={
            <View style={styles.header}>
              <ServicingHeader title={TITLE} subtitle={loanNumber} />
              <View style={styles.headerCards}>
                <ScheduleOverviewCard loan={loan} nextPeriod={nextPeriod} />
                {periods.length > 0 ? (
                  <Text style={styles.section} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
                    {`Lịch trả từng kỳ (${periods.length} kỳ)`}
                  </Text>
                ) : null}
              </View>
            </View>
          }
          ListEmptyComponent={
            <DetailNote tone="warn">
              Chưa nhận được lịch trả từng kỳ của khoản vay này. Kéo xuống để tải lại sau ít phút.
            </DetailNote>
          }
          contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xs }]}
          refreshControl={
            <RefreshControl
              refreshing={state.loading}
              onRefresh={state.reload}
              // iOS đọc `tintColor`, Android đọc `colors`.
              tintColor={Colors.authPrimary}
              colors={[Colors.authPrimary]}
            />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
        />
      </View>
    </View>
  );
}

function CardGap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  // Nền trùng hàng trên cùng của ảnh sóng: hai bên cột trên web và lúc kéo làm mới vẫn liền màu.
  root: { flex: 1, alignItems: 'center', backgroundColor: Colors.homeWaveTop },
  column: { flex: 1 },
  list: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: SERVICING_PADDING, paddingBottom: SERVICING_BOTTOM_SPACE },
  header: { marginBottom: Spacing.lg },
  // Cùng nhịp với `ServicingScaffold`: đầu màn cách thẻ đầu 8pt, các khối cách nhau 12pt.
  headerCards: { gap: Spacing.lg, marginTop: Spacing.md },
  section: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.bold,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.authInk,
  },
  gap: { height: Spacing.lg },
});
