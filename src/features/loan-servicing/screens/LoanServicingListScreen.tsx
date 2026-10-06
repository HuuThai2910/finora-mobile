import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState, ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing } from '@/theme';
import LoanCard from '../components/ServicingLoanCard';
import { useServicingLoans } from '../hooks/useLoanServicing';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'LoanServicingList'>;

/** Danh sách khoản đã giải ngân của người vay; không trộn với hồ sơ chờ duyệt/hợp đồng chờ ký. */
export default function LoanServicingListScreen() {
  const nav = useNavigation<Nav>();
  const state = useServicingLoans();

  if (state.loading && !state.data) return <Screen><PHeader title="Khoản vay đang trả" back /><LoadingScreen cards={4} /></Screen>;
  if (state.error) return <Screen><PHeader title="Khoản vay đang trả" back /><ErrorState message={state.error} onRetry={state.reload} /></Screen>;

  return (
    <Screen scroll={false}>
      <PHeader title="Khoản vay đang trả" back hint={`${state.data?.totalElements ?? 0} khoản`} />
      <FlatList
        style={styles.list}
        data={state.data?.data ?? []}
        keyExtractor={item => item.loanNumber}
        renderItem={({ item }) => (
          <LoanCard loan={item} onPress={() => nav.navigate('LoanServicingDetail', { loanNumber: item.loanNumber })} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState icon="fileText" title="Chưa có khoản vay đang trả" hint="Khoản vay sẽ xuất hiện sau khi hợp đồng có hiệu lực và giải ngân thành công." />}
        contentContainerStyle={styles.content}
        refreshing={state.loading}
        onRefresh={state.reload}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: Spacing.section },
  separator: { height: Spacing.lg },
});

