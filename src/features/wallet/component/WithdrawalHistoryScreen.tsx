import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WalletStackParamList } from '@/navigation/types';
import { Spacing } from '@/theme';
import { WITHDRAW_DEMO_SHORT_NOTE } from '../constant';
import { useWithdrawalHistory } from '../hook/useWithdrawalHistory';
import { useWithdrawalPolicy } from '../hook/useWallet';
import WalletButton from './WalletButton';
import WalletHistorySkeleton from './WalletHistorySkeleton';
import WalletHistoryStatus from './WalletHistoryStatus';
import WalletNote from './WalletNote';
import WalletScaffold from './WalletScaffold';
import WithdrawalCard from './WithdrawalCard';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'WithdrawalHistory'>;

/**
 * Lịch sử lệnh rút tiền, mới nhất trước, mỗi lần một trang và "Xem thêm" để tải tiếp. Mỗi trang chỉ vài chục thẻ nên
 * vẽ bằng ScrollView để nền minh hoạ cuộn cùng nội dung như các màn ví khác. Bấm một lệnh để xem trạng thái của nó.
 */
export default function WithdrawalHistoryScreen() {
  const nav = useNavigation<Nav>();
  const history = useWithdrawalHistory();
  const policy = useWithdrawalPolicy();
  // Chưa đọc được policy thì coi như giả lập: W3B chỉ có provider giả lập.
  const simulated = policy.data?.simulatedProvider ?? true;
  const hasFocusedOnce = useRef(false);
  const refresh = history.refresh;

  // Quay lại từ màn trạng thái thì lệnh có thể đã đổi trạng thái: tải lại trang đầu.
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnce.current) refresh();
      else hasFocusedOnce.current = true;
    }, [refresh]),
  );

  const renderBody = () => {
    if (history.loading) return <WalletHistorySkeleton label="Đang tải lịch sử rút tiền" />;
    if (history.items.length === 0) {
      return history.error ? (
        <WalletHistoryStatus kind="error" message={history.error} onRetry={history.refresh} />
      ) : (
        <WalletHistoryStatus kind="noWithdrawals" onWithdraw={() => nav.navigate('Withdraw')} />
      );
    }
    return (
      <>
        {history.error ? <WalletNote tone="danger" text={history.error} /> : null}
        <View style={styles.list}>
          {history.items.map(item => (
            <WithdrawalCard
              key={item.withdrawalId}
              withdrawal={item}
              // `push` để mỗi lần mở là một màn trạng thái riêng, không thay tham số của màn trạng thái đã có trong stack.
              onPress={() => nav.push('WithdrawalDetail', { withdrawalId: item.withdrawalId })}
            />
          ))}
        </View>
        {history.loadMoreError ? <WalletNote tone="danger" text={history.loadMoreError} /> : null}
        {history.hasMore ? (
          <WalletButton
            variant="outline"
            label="Xem thêm lệnh cũ hơn"
            onPress={history.loadMore}
            loading={history.loadingMore}
          />
        ) : null}
      </>
    );
  };

  return (
    <WalletScaffold title="Lịch sử rút tiền" refreshing={history.refreshing} onRefresh={history.refresh}>
      {renderBody()}
      {simulated ? <WalletNote tone="warn" text={WITHDRAW_DEMO_SHORT_NOTE} /> : null}
    </WalletScaffold>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.md },
});
