import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import { useListMyContractsQuery } from '../api/applicationApi';
import ContractCard from '../components/ContractCard';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'MyContracts'>;

/** Danh sách hợp đồng thuộc borrower hiện tại; tách khỏi danh sách hồ sơ đã nộp. */
export default function MyContractsScreen() {
  const navigation = useNavigation<Nav>();
  const query = useListMyContractsQuery({ page: 0, size: 20 });

  if (query.isLoading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (query.error) {
    return <Screen><ErrorState message="Không thể tải danh sách hợp đồng. Vui lòng thử lại." onRetry={query.refetch} /></Screen>;
  }

  return (
    <Screen scroll={false}>
      <PHeader title="Hợp đồng vay của tôi" back hint={`${query.data?.totalElements ?? 0} hợp đồng`} />
      <FlatList
        data={query.data?.data ?? []}
        keyExtractor={(item) => item.contractNumber}
        renderItem={({ item }) => (
          <ContractCard
            contract={item}
            onPress={() => navigation.navigate('ContractDetail', { contractNumber: item.contractNumber })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={(query.data?.data.length ?? 0) === 0 ? styles.emptyContent : styles.content}
        refreshing={query.isFetching}
        onRefresh={query.refetch}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Chưa có hợp đồng vay</Text>
            <Text style={styles.emptyText}>Hợp đồng sẽ xuất hiện sau khi hồ sơ được quản trị viên phê duyệt.</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: Spacing.section },
  separator: { height: Spacing.lg },
  emptyContent: { flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.md },
  emptyTitle: { ...Text_.heading, color: Colors.ink, textAlign: 'center' },
  emptyText: { ...Text_.body, color: Colors.ink3, textAlign: 'center' },
});
