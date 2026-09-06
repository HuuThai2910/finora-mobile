import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import ApplicationCard from '../components/ApplicationCard';
import { useMyApplications } from '../hook/useApplications';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'MyApplications'>;

/** Danh sách hồ sơ của borrower lấy từ Loan Service; không dùng mock servicing của các LN chưa triển khai. */
export default function MyApplicationsScreen() {
  const navigation = useNavigation<Nav>();
  const applications = useMyApplications();

  if (applications.loading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (applications.error) {
    return <Screen><ErrorState message={applications.error} onRetry={applications.reload} /></Screen>;
  }

  return (
    <Screen scroll={false}>
      <PHeader title="Hồ sơ vay của tôi" back hint={`${applications.totalElements} hồ sơ`} />
      <FlatList
        data={applications.data ?? []}
        keyExtractor={(item) => item.applicationNumber}
        renderItem={({ item }) => (
          <ApplicationCard
            application={item}
            contract={applications.contractsByApplication.get(item.applicationNumber)}
            onPress={() => navigation.navigate('ApplicationDetail', { applicationNumber: item.applicationNumber })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={(applications.data?.length ?? 0) === 0 ? styles.emptyContent : styles.content}
        refreshing={applications.refreshing}
        onRefresh={applications.reload}
        ListHeaderComponent={applications.contractStatusUnavailable ? (
          <InfoNote tone="warn" style={styles.contractWarning}>
            Chưa tải được trạng thái hợp đồng mới nhất. Kéo xuống để thử lại.
          </InfoNote>
        ) : null}
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
  contractWarning: { marginBottom: Spacing.lg },
  separator: { height: Spacing.lg },
  emptyContent: { flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.md },
  emptyTitle: { ...Text_.heading, color: Colors.ink, textAlign: 'center' },
  emptyText: { ...Text_.body, color: Colors.ink3, textAlign: 'center' },
});
