import type { Step } from '@/components/phone';
import type { LoanContractDetail } from '@/types/contract';
import { useGetContractHistoryQuery, useGetContractQuery } from '../api/applicationApi';
import type { StatusMeta } from '../constant';
import { toLoadError } from '../mappers/apiError';
import { contractStatusMeta } from '../mappers/statusMeta';
import { buildContractTimeline } from '../mappers/timeline';
import { useCountdown, type Countdown } from './useCountdown';
import { latestStatus, useHistoryInSync } from './useHistoryInSync';

const HISTORY_PAGE_SIZE = 20;

export type ContractDetailView = {
  contract: LoanContractDetail;
  status: StatusMeta;
  timeline: Step[];
  timelineFailed: boolean;
  countdown: Countdown;
  /** Còn ký hoặc từ chối được: đúng trạng thái chờ ký và chưa quá hạn. */
  canRespond: boolean;
  /** Borrower chưa ký nên còn quyền từ chối, kể cả lúc đang chờ lender hoặc SmartCA đang xử lý. */
  canDecline: boolean;
  /** Đang chờ ký nhưng đã quá hạn — backend sẽ tự chuyển `EXPIRED`. */
  expiredWhileWaiting: boolean;
};

export type ContractDetailState = {
  loading: boolean;
  loadError: string | null;
  refreshing: boolean;
  reload: () => void;
  view: ContractDetailView | null;
};

/**
 * Dữ liệu màn chi tiết hợp đồng.
 *
 * Hạn xác nhận được tính bằng đồng hồ đếm ngược có nhịp riêng nên nút ký tự
 * khoá đúng thời điểm hết hạn thay vì chờ người dùng tải lại trang.
 */
export function useContractDetail(contractNumber: string): ContractDetailState {
  // Nhà đầu tư ký, SmartCA trả kết quả, hệ thống giải ngân... đều đổi trạng thái ở phía máy chủ:
  // mở màn là tải mới, không dùng bản đệm của lần xem trước.
  const contractQuery = useGetContractQuery(contractNumber, { refetchOnMountOrArgChange: true });
  const historyQuery = useGetContractHistoryQuery(
    { contractNumber, page: 0, size: HISTORY_PAGE_SIZE },
    { refetchOnMountOrArgChange: true },
  );
  const contract = contractQuery.data ?? null;
  const countdown = useCountdown(contract?.expiresAt ?? null);
  useHistoryInSync(
    contract?.status,
    latestStatus(historyQuery.data?.data ?? [], item => item.occurredAt),
    historyQuery.isFetching,
    historyQuery.refetch,
  );

  const reload = () => {
    contractQuery.refetch();
    historyQuery.refetch();
  };

  const waitingSignature = contract?.status === 'PENDING_SIGNATURE'
    || contract?.status === 'PENDING_BORROWER_SIGNATURE';
  const declineWindow = waitingSignature
    || contract?.status === 'PENDING_LENDER_SIGNATURES'
    || contract?.status === 'PENDING_REFUNDING'
    || contract?.status === 'SIGNING';

  const view: ContractDetailView | null = contract
    ? {
        contract,
        status: contractStatusMeta(contract.status),
        timeline: buildContractTimeline(historyQuery.data?.data ?? [], contract.status),
        timelineFailed: Boolean(historyQuery.error),
        countdown,
        canRespond: waitingSignature && !countdown.expired,
        canDecline: declineWindow && !countdown.expired,
        expiredWhileWaiting: declineWindow && countdown.expired,
      }
    : null;

  return {
    loading: contractQuery.isLoading,
    loadError:
      contractQuery.error || (!contractQuery.isLoading && !contract)
        ? toLoadError(contractQuery.error, 'Không tải được hợp đồng vay.')
        : null,
    refreshing: contractQuery.isFetching || historyQuery.isFetching,
    reload,
    view,
  };
}
