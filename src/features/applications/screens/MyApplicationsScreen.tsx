import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import { useListMyApplicationsQuery } from '../api/applicationApi';
import ApplicationCard from '../components/ApplicationCard';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'MyApplications'>;

/** Danh sách hồ sơ của borrower lấy từ Loan Service; không dùng mock servicing của các LN chưa triển khai. */
export default function MyApplicationsScreen() {
  const navigation = useNavigation<Nav>();
  const query = useListMyApplicationsQuery({ page: 0, size: 20 });

  if (query.isLoading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (query.error) {
    return <Screen><ErrorState message="Không thể tải hồ sơ vay. Vui lòng kiểm tra kết nối và thử lại." onRetry={query.refetch} /></Screen>;
  }

  return (
    <Screen scroll={false}>
      <PHeader title="Hồ sơ vay của tôi" back hint={`${query.data?.totalElements ?? 0} hồ sơ`} />
      <FlatList
        data={query.data?.data ?? []}
        keyExtractor={(item) => item.applicationNumber}
        renderItem={({ item }) => (
          <ApplicationCard
            application={item}
            onPress={() => navigation.navigate('ApplicationDetail', { applicationNumber: item.applicationNumber })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={(query.data?.data.length ?? 0) === 0 ? styles.emptyContent : styles.content}
        refreshing={query.isFetching}
        onRefresh={query.refetch}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Chưa có hồ sơ vay</Text>
            <Text style={styles.emptyText}>Hồ sơ sau khi nộp sẽ xuất hiện tại đây để bạn theo dõi.</Text>
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
