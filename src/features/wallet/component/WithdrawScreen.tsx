import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WalletStackParamList } from '@/navigation/types';
import type { CreateWithdrawalRequest } from '@/types/wallet';
import { WITHDRAW_DEMO_NOTE } from '../constant';
import { useCreateWithdrawal } from '../hook/useCreateWithdrawal';
import { useWithdrawalPolicy } from '../hook/useWallet';
import WalletAccountCard from './WalletAccountCard';
import WalletButton from './WalletButton';
import WalletHistorySkeleton from './WalletHistorySkeleton';
import WalletHistoryStatus from './WalletHistoryStatus';
import WalletNote from './WalletNote';
import WalletScaffold from './WalletScaffold';
import WithdrawForm from './WithdrawForm';
import WithdrawPolicyCard from './WithdrawPolicyCard';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'Withdraw'>;

/**
 * Màn 24 — rút tiền từ ví về tài khoản ngân hàng (R4, W3B), cùng bộ với "Nạp tiền vào ví": số dư khả dụng, nhãn môi
 * trường demo khi provider là bản giả lập, hạn mức theo policy của Payment, rồi form tài khoản nhận và số tiền.
 *
 * Gửi lệnh có xác nhận PIN; tạo được lệnh (tiền đã rời ví) thì chuyển sang màn trạng thái để theo dõi tới khi có kết
 * quả cuối. Màn chỉ điều phối: form, PIN/idempotency và theo dõi trạng thái nằm ở component/hook riêng.
 */
export default function WithdrawScreen() {
  const nav = useNavigation<Nav>();
  const policy = useWithdrawalPolicy();
  const create = useCreateWithdrawal();

  const submit = async (request: CreateWithdrawalRequest) => {
    const outcome = await create.submit(request);
    if (outcome.kind === 'created') {
      // Thay chỗ form để nút quay lại không đưa về form vừa gửi; lệnh tiếp theo sẽ là một ý định mới.
      nav.replace('WithdrawalDetail', { withdrawalId: outcome.withdrawal.withdrawalId });
    } else if (outcome.kind === 'failed' && outcome.code?.startsWith('WITHDRAWAL_')) {
      // Payment từ chối theo hạn mức hay số dư: tải lại policy để con số trên màn khớp lý do vừa báo. Dữ liệu cũ vẫn
      // giữ trong lúc tải nên form đang nhập không bị gỡ.
      policy.reload();
    }
  };

  const renderBody = () => {
    if (!policy.data) {
      if (policy.loading) return <WalletHistorySkeleton cards={3} label="Đang tải hạn mức rút tiền" />;
      return (
        <WalletHistoryStatus
          kind="error"
          message={policy.error ?? 'Không tải được hạn mức rút tiền.'}
          onRetry={policy.reload}
        />
      );
    }
    return (
      <>
        {policy.data.simulatedProvider ? <WalletNote tone="warn" text={WITHDRAW_DEMO_NOTE} /> : null}
        <WithdrawPolicyCard policy={policy.data} />
        <WithdrawForm
          policy={policy.data}
          submitting={create.submitting}
          submitError={create.error}
          onSubmit={request => void submit(request)}
          onEdit={create.clearError}
        />
      </>
    );
  };

  return (
    // Kéo để làm mới policy (hạn mức còn lại, số dư) mà không gỡ form đang nhập.
    <WalletScaffold title="Rút tiền" refreshing={policy.loading && !!policy.data} onRefresh={policy.reload}>
      <WalletAccountCard
        available={policy.data?.availableBalance ?? null}
        held={null}
        loading={policy.loading}
        error={policy.error}
        onRetry={policy.reload}
      />
      {renderBody()}
      <WalletButton
        variant="text"
        icon="receipt"
        label="Lịch sử rút tiền"
        onPress={() => nav.navigate('WithdrawalHistory')}
      />
    </WalletScaffold>
  );
}
