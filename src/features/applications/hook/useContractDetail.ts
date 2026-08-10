import type { Step } from '@/components/phone';
import type { LoanContractDetail } from '@/types/contract';
import { formatAnnualRate, formatDong } from '@/utils/format';
import { useGetContractHistoryQuery, useGetContractQuery } from '../api/applicationApi';
import type { StatusMeta } from '../constant';
import { toLoadError } from '../mappers/apiError';
import { contractStatusMeta } from '../mappers/statusMeta';
import { buildContractTimeline } from '../mappers/timeline';
import type { KeyTerm } from '../components/KeyTermsStrip';
import { useCountdown, type Countdown } from './useCountdown';

const HISTORY_PAGE_SIZE = 20;

export type ContractDetailView = {
  contract: LoanContractDetail;
  status: StatusMeta;
  keyTerms: KeyTerm[];
  timeline: Step[];
  timelineFailed: boolean;
  countdown: Countdown;
  /** Còn ký hoặc từ chối được: đúng trạng thái chờ ký và chưa quá hạn. */
  canRespond: boolean;
  /** Đang chờ ký nhưng đã quá hạn — backend sẽ tự chuyển `EXPIRED`. */
  expiredWhileWaiting: boolean;
  periodCount: number;
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
  const contractQuery = useGetContractQuery(contractNumber);
  const historyQuery = useGetContractHistoryQuery({
    contractNumber,
    page: 0,
    size: HISTORY_PAGE_SIZE,
  });
  const contract = contractQuery.data ?? null;
  const countdown = useCountdown(contract?.expiresAt ?? null);

  const reload = () => {
    contractQuery.refetch();
    historyQuery.refetch();
  };

  const waitingSignature = contract?.status === 'PENDING_SIGNATURE';

  const view: ContractDetailView | null = contract
    ? {
        contract,
        status: contractStatusMeta(contract.status),
        keyTerms: [
          { label: 'Số tiền vay', value: formatDong(contract.principalAmount) },
          { label: 'Kỳ hạn', value: `${contract.termMonths} tháng` },
          { label: 'Lãi suất', value: formatAnnualRate(contract.annualInterestRate) },
        ],
        timeline: buildContractTimeline(historyQuery.data?.data ?? [], contract.status),
        timelineFailed: Boolean(historyQuery.error),
        countdown,
        canRespond: waitingSignature && !countdown.expired,
        expiredWhileWaiting: waitingSignature && countdown.expired,
        periodCount: contract.schedulePeriods?.length ?? 0,
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
