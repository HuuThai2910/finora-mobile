import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveBackdrop } from '@/components/phone';
import { CONTRACTS_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing } from '@/theme';
import { useListMyContractsQuery } from '../api/applicationApi';
import ApplicationListStatus from '../components/ApplicationListStatus';
import ContractListCard from '../components/ContractListCard';
import ContractListHeader from '../components/ContractListHeader';
import ContractListSkeleton from '../components/ContractListSkeleton';
import { APPLICATION_LIST_MAX_WIDTH, APPLICATION_LIST_PADDING } from '../constant';
import { useContractFilter } from '../hook/useContractFilter';
import { contractStatusMeta } from '../mappers/statusMeta';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'MyContracts'>;

/** Đáy chừa một khoảng để thẻ cuối không sát mép dưới màn. */
const BOTTOM_SPACE = 56;

/**
 * Danh sách hợp đồng của borrower (mockup 26/09/2026), mở từ tab Hồ sơ → Hợp
 * đồng. Cùng tham số trang với màn "Hồ sơ vay" nên dùng chung cache RTK Query;
 * người vay thực tế có ít hợp đồng nên vẽ bằng ScrollView để nền cuộn cùng thẻ.
 */
export default function MyContractsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, APPLICATION_LIST_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để nền trơn phủ tới đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);

  const query = useListMyContractsQuery({ page: 0, size: 100 });
  const contracts = query.data?.data ?? [];
  const filter = useContractFilter(contracts);

  // Có lỗi thì báo lỗi kèm nút thử lại, kể cả khi cache còn dữ liệu cũ, thay vì
  // lặng lẽ hiện danh sách lỗi thời.
  const phase = query.isLoading ? 'loading' : query.error ? 'error' : 'ready';

  const renderBody = () => {
    if (phase === 'loading') return <ContractListSkeleton />;
    if (phase === 'error') {
      return (
        <ApplicationListStatus
          kind="error"
          message="Không thể tải danh sách hợp đồng."
          retrying={query.isFetching}
          onRetry={query.refetch}
        />
      );
    }
    if (contracts.length === 0) {
      return (
        <ApplicationListStatus
          kind="empty"
          title="Bạn chưa có hợp đồng vay nào"
          hint="Hợp đồng được lập sau khi hồ sơ vay được duyệt. Khi đó bạn đọc và ký hợp đồng ngay tại đây."
          action="Xem hồ sơ vay"
          onAction={() => navigation.navigate('MyApplications')}
        />
      );
    }
    if (filter.visible.length === 0 && filter.selected !== 'all') {
      return (
        <ApplicationListStatus
          kind="filtered"
          stageLabel={contractStatusMeta(filter.selected).label}
          noun="hợp đồng"
          onShowAll={() => filter.select('all')}
        />
      );
    }
    return (
      <View style={styles.cards}>
        {filter.visible.map(contract => (
          <ContractListCard
            key={contract.contractNumber}
            contract={contract}
            onPress={() => navigation.navigate('ContractDetail', { contractNumber: contract.contractNumber })}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
      refreshControl={
        <RefreshControl
          // Lần tải đầu đã có khung giả; vòng xoay chỉ dành cho kéo làm mới.
          refreshing={query.isFetching && !query.isLoading}
          onRefresh={query.refetch}
          // iOS đọc `tintColor`, Android đọc `colors`.
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={CONTRACTS_WAVES} width={width} />
        <View style={styles.content}>
          <ContractListHeader
            width={width}
            topInset={insets.top}
            loading={phase === 'loading'}
            chips={phase === 'ready' && contracts.length > 0 ? filter.chips : null}
            selected={filter.selected}
            onSelect={filter.select}
          />
          {renderBody()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trơn của ảnh: phủ hai bên cột trên web rộng và lót lúc ảnh chưa nạp xong.
  root: { flex: 1, backgroundColor: Colors.contractsFill },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { paddingHorizontal: APPLICATION_LIST_PADDING, paddingBottom: BOTTOM_SPACE },
  cards: { gap: Spacing.lg },
});
