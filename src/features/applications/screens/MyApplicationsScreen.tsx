import { FlatList, RefreshControl, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList, TabParamList } from '@/navigation/types';
import { Spacing } from '@/theme';
import ApplicationCard from '../components/ApplicationCard';
import ApplicationListHeader from '../components/ApplicationListHeader';
import ApplicationListSkeleton from '../components/ApplicationListSkeleton';
import ApplicationListStatus from '../components/ApplicationListStatus';
import ApplicationsBackdrop from '../components/ApplicationsBackdrop';
import { APPLICATION_LIST_MAX_WIDTH, APPLICATION_LIST_PADDING, APPLICATION_STAGES } from '../constant';
import { useApplicationFilter } from '../hook/useApplicationFilter';
import { useMyApplications } from '../hook/useApplications';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'MyApplications'>,
  BottomTabNavigationProp<TabParamList>
>;

/** Đáy chừa một dải để lớp sóng đáy lộ ra dưới thẻ cuối như mockup. */
const BOTTOM_SPACE = 72;

/**
 * Danh sách hồ sơ vay của borrower lấy từ Loan Service, vẽ theo mockup
 * 26/09/2026; không dùng mock servicing của các LN chưa triển khai. Màn chỉ điều
 * phối: dữ liệu ở `useMyApplications`, lọc theo nhóm ở `useApplicationFilter`.
 */
export default function MyApplicationsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, APPLICATION_LIST_MAX_WIDTH);
  const applications = useMyApplications();
  const filter = useApplicationFilter(applications.data ?? [], applications.contractsByApplication);

  // Giữ thứ tự ưu tiên cũ: đang tải lần đầu → khung giả; có lỗi → báo lỗi kèm nút
  // thử lại, kể cả khi cache còn dữ liệu cũ, thay vì lặng lẽ hiện danh sách lỗi thời.
  const phase = applications.loading ? 'loading' : applications.error ? 'error' : 'ready';
  const loadedCount = applications.data?.length ?? 0;
  const selectedStage = APPLICATION_STAGES.find(stage => stage.key === filter.selected);

  const renderStatus = () => {
    if (phase === 'loading') return <ApplicationListSkeleton />;
    if (applications.error) {
      return (
        <ApplicationListStatus
          kind="error"
          message={applications.error}
          retrying={applications.refreshing}
          onRetry={applications.reload}
        />
      );
    }
    if (loadedCount === 0) {
      return (
        <ApplicationListStatus
          kind="empty"
          title="Bạn chưa có hồ sơ vay nào"
          hint="Chọn một sản phẩm vay phù hợp để nộp hồ sơ. Hồ sơ đã nộp sẽ hiện ở đây để bạn theo dõi."
          action="Xem sản phẩm vay"
          onAction={() => navigation.navigate('Sàn', { screen: 'Products' })}
        />
      );
    }
    return (
      <ApplicationListStatus
        kind="filtered"
        stageLabel={selectedStage?.label ?? ''}
        noun="hồ sơ"
        onShowAll={() => filter.select('all')}
      />
    );
  };

  return (
    <ApplicationsBackdrop width={width}>
      <FlatList
        data={phase === 'ready' ? filter.visible : []}
        keyExtractor={item => item.application.applicationNumber}
        renderItem={({ item }) => (
          <ApplicationCard
            application={item.application}
            contract={item.contract}
            onPress={() =>
              navigation.navigate('ApplicationDetail', {
                applicationNumber: item.application.applicationNumber,
              })
            }
          />
        )}
        ItemSeparatorComponent={CardGap}
        ListHeaderComponent={
          <ApplicationListHeader
            width={width}
            topInset={insets.top}
            total={phase === 'ready' ? applications.totalElements : null}
            loading={phase === 'loading'}
            chips={phase === 'ready' && loadedCount > 0 ? filter.chips : null}
            selected={filter.selected}
            onSelect={filter.select}
            contractStatusUnavailable={phase === 'ready' && applications.contractStatusUnavailable}
          />
        }
        ListEmptyComponent={renderStatus()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            // Lần tải đầu đã có khung giả; vòng xoay chỉ dành cho kéo làm mới.
            refreshing={applications.refreshing && !applications.loading}
            onRefresh={applications.reload}
            // iOS đọc `tintColor`, Android đọc `colors`.
            tintColor={Colors.authPrimary}
            colors={[Colors.authPrimary]}
          />
        }
      />
    </ApplicationsBackdrop>
  );
}

function CardGap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: APPLICATION_LIST_PADDING,
    paddingBottom: BOTTOM_SPACE,
  },
  gap: { height: Spacing.lg },
});
