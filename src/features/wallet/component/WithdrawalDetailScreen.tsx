import { useIsFocused, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WalletStackParamList } from '@/navigation/types';
import type { Withdrawal } from '@/types/wallet';
import { WITHDRAW_DEMO_SHORT_NOTE } from '../constant';
import { useWithdrawalPolicy } from '../hook/useWallet';
import { useWithdrawalTracking } from '../hook/useWithdrawalTracking';
import { isFinalWithdrawal, withdrawalDetailRows, withdrawalStatusView } from '../mappers/withdrawal';
import TopUpDetailsCard from './TopUpDetailsCard';
import WalletHistorySkeleton from './WalletHistorySkeleton';
import WalletHistoryStatus from './WalletHistoryStatus';
import WalletNote from './WalletNote';
import WalletScaffold from './WalletScaffold';
import WithdrawalStatusCard from './WithdrawalStatusCard';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'WithdrawalDetail'>;
type Route = RouteProp<WalletStackParamList, 'WithdrawalDetail'>;

/**
 * Trạng thái một lệnh rút, mở ngay sau khi tạo lệnh hoặc từ lịch sử. Chỉ nhận mã lệnh qua navigation và tự đọc lại
 * lệnh từ Payment; lệnh chưa có kết quả cuối thì tự hỏi lại trong lúc màn đang hiển thị, tới khi `COMPLETED` hoặc
 * `FAILED` (kèm lý do và việc tiền đã hoàn về ví).
 */
export default function WithdrawalDetailScreen() {
  const nav = useNavigation<Nav>();
  const { withdrawalId } = useRoute<Route>().params;
  // Màn bị che bởi màn khác trong stack (mở lịch sử) thì thôi hỏi lại; quay về thì hỏi tiếp.
  const focused = useIsFocused();
  const tracking = useWithdrawalTracking(withdrawalId, focused);
  const policy = useWithdrawalPolicy();
  // Chưa đọc được policy thì coi như giả lập: W3B chỉ có provider giả lập, và câu chữ không được ngụ ý tiền thật.
  const simulated = policy.data?.simulatedProvider ?? true;

  const backToWallet = () => {
    // Mở từ nút "Rút" ở trang chủ thì stack Ví không có màn gốc, popToTop không có chỗ để về.
    if (nav.getState().routes[0]?.name === 'WalletHistory') nav.popToTop();
    else nav.replace('WalletHistory');
  };

  const actionsFor = (withdrawal: Withdrawal) => {
    const toWallet = { label: 'Về ví', onPress: backToWallet };
    switch (withdrawalStatusView(withdrawal.status).phase) {
      case 'completed':
        return { primary: toWallet, secondary: { label: 'Lịch sử rút tiền', onPress: () => nav.navigate('WithdrawalHistory') } };
      case 'failed':
        return { primary: { label: 'Tạo lệnh rút mới', onPress: () => nav.navigate('Withdraw') }, secondary: toWallet };
      default:
        // Đang tự cập nhật thì không cần nút; dừng rồi mới cho bấm kiểm tra lại.
        return {
          primary: tracking.watching
            ? undefined
            : { label: 'Kiểm tra lại', onPress: tracking.refresh, loading: tracking.checking },
          secondary: toWallet,
        };
    }
  };

  const renderBody = () => {
    const { withdrawal } = tracking;
    if (!withdrawal) {
      if (tracking.loading) return <WalletHistorySkeleton cards={2} label="Đang tải lệnh rút" />;
      return (
        <WalletHistoryStatus
          kind="error"
          message={tracking.error ?? 'Không tải được lệnh rút.'}
          onRetry={tracking.refresh}
        />
      );
    }
    return (
      <>
        <WithdrawalStatusCard
          withdrawal={withdrawal}
          simulated={simulated}
          watching={tracking.watching && !isFinalWithdrawal(withdrawal.status)}
          {...actionsFor(withdrawal)}
        />
        {tracking.error ? <WalletNote tone="danger" text={tracking.error} /> : null}
        <TopUpDetailsCard rows={withdrawalDetailRows(withdrawal)} />
        {simulated ? <WalletNote tone="warn" text={WITHDRAW_DEMO_SHORT_NOTE} /> : null}
      </>
    );
  };

  return <WalletScaffold title="Lệnh rút tiền">{renderBody()}</WalletScaffold>;
}
