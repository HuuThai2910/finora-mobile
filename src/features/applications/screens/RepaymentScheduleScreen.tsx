import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { EmptyState, ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Card, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_, tabularNums } from '@/theme';
import { formatDate, formatDong } from '@/utils/format';
import SchedulePeriodRow from '../components/SchedulePeriodRow';
import { useRepaymentSchedule, type ScheduleView } from '../hook/useRepaymentSchedule';

type Route = RouteProp<ProfileStackParamList, 'RepaymentSchedule'>;

/**
 * Lịch trả đầy đủ tách khỏi màn chi tiết vì một khoản vay có thể tới 60 kỳ.
 * Dùng `FlatList` để chỉ dựng những hàng đang nhìn thấy, thay cho việc nhồi cả
 * danh sách vào `ScrollView` của màn chi tiết như bản cũ.
 */
export default function RepaymentScheduleScreen() {
  const { source, number } = useRoute<Route>().params;
  const state = useRepaymentSchedule(source, number);
  const title = 'Lịch trả nợ';

  if (state.loading) {
    return (
      <Screen>
        <PHeader title={title} back />
        <LoadingScreen cards={4} />
      </Screen>
    );
  }

  if (state.loadError || !state.view) {
    return (
      <Screen>
        <PHeader title={title} back />
        <ErrorState
          message={state.loadError ?? 'Không tải được lịch trả nợ.'}
          onRetry={state.reload}
        />
      </Screen>
    );
  }

  const view = state.view;
  const periods = view.periods;

  return (
    <Screen scroll={false}>
      <PHeader
        title={title}
        back
        hint={periods.length > 0 ? `${periods.length} kỳ` : undefined}
      />
      <FlatList
        style={styles.list}
        data={periods}
        keyExtractor={item => String(item.period)}
        renderItem={({ item }) => <SchedulePeriodRow period={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={<ScheduleSummary view={view} />}
        ListEmptyComponent={
          <EmptyState
            icon="clock"
            title="Chưa có lịch trả từng kỳ"
            hint="Loan Service chưa trả về chi tiết các kỳ. Kéo xuống để tải lại."
          />
        }
        contentContainerStyle={styles.content}
        refreshing={state.refreshing}
        onRefresh={state.reload}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
      />
    </Screen>
  );
}

function ScheduleSummary({ view }: { view: ScheduleView }) {
  const estimate = view.origin === 'estimate';

  return (
    <View style={styles.summary}>
      <Card style={styles.totalsCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng phải trả</Text>
          <Text style={styles.totalValue}>{formatDong(view.totalRepayment)}</Text>
        </View>
        <View style={styles.grid}>
          <Cell label="Tiền gốc" value={formatDong(view.totalPrincipal)} />
          <Cell label="Tiền lãi" value={formatDong(view.totalInterest)} />
          <Cell label="Phí" value={formatDong(view.totalFees)} />
          <Cell label="Kỳ cao nhất" value={formatDong(view.maximumInstallment)} />
        </View>
        <Text style={styles.disbursement}>
          Tính theo ngày giải ngân {formatDate(view.expectedDisbursementDate)}
        </Text>
      </Card>

      <InfoNote tone={estimate ? 'warn' : 'info'}>
        {estimate
          ? 'Lịch dự kiến tính lúc nộp hồ sơ. Số tiền và ngày có thể đổi khi khoản vay được duyệt và giải ngân thực tế.'
          : 'Lịch theo điều khoản đã chốt trong hợp đồng. Ngày cụ thể có thể dịch theo ngày giải ngân thực tế.'}
      </InfoNote>

      {view.periods.length > 0 ? (
        <Text style={styles.hint}>Chạm một kỳ để xem tách tiền gốc, lãi, phí và dư nợ còn lại.</Text>
      ) : null}
    </View>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingBottom: Spacing.section, flexGrow: 1 },
  separator: { height: Spacing.md },
  summary: { gap: Spacing.lg, marginBottom: Spacing.xl },
  totalsCard: { gap: Spacing.lg },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.lg,
  },
  totalLabel: { ...Text_.body, color: Colors.ink2 },
  totalValue: { ...Text_.display, color: Colors.ink, flexShrink: 1, ...tabularNums },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  cell: { flexGrow: 1, flexBasis: '45%', gap: Spacing.xxs },
  cellLabel: { ...Text_.caption, color: Colors.ink3 },
  cellValue: { ...Text_.microBold, color: Colors.ink, ...tabularNums },
  disbursement: { ...Text_.caption, color: Colors.ink3 },
  hint: { ...Text_.caption, color: Colors.ink3 },
});
