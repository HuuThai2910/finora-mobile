import { useState } from 'react';
import type { Step } from '@/components/phone';
import type { LoanApplication } from '@/types/loan';
import type { LoanContractSummary } from '@/types/contract';
import { formatAnnualRate, formatDong } from '@/utils/format';
import {
  useGetApplicationHistoryQuery,
  useGetApplicationQuery,
  useListMyContractsQuery,
  useWithdrawApplicationMutation,
} from '../api/applicationApi';
import { WITHDRAWABLE_STATUSES, type StatusMeta } from '../constant';
import { toActionError, toLoadError, type ActionError } from '../mappers/apiError';
import { applicationJourneyStatus } from '../mappers/statusMeta';
import { buildApplicationTimeline } from '../mappers/timeline';
import type { KeyTerm } from '../components/KeyTermsStrip';

const HISTORY_PAGE_SIZE = 20;
const CONTRACT_LOOKUP_SIZE = 100;

export type ApplicationDetailView = {
  application: LoanApplication;
  /** Lịch phù hợp với trạng thái người vay đang xem: ban đầu hoặc đã chốt sau duyệt. */
  displayedSchedule: LoanApplication['calculationSnapshot'];
  status: StatusMeta;
  keyTerms: KeyTerm[];
  timeline: Step[];
  timelineFailed: boolean;
  canWithdraw: boolean;
  periodCount: number;
  /**
   * Hợp đồng sinh ra từ hồ sơ này, nếu tìm được. Backend chưa gắn
   * `contractNumber` vào Application nên phải dò ngược từ danh sách hợp đồng
   * của chính người dùng; không tìm thấy thì UI lui về danh sách hợp đồng.
   */
  contract: LoanContractSummary | null;
};

export type ApplicationDetailState = {
  loading: boolean;
  loadError: string | null;
  refreshing: boolean;
  reload: () => void;
  view: ApplicationDetailView | null;
  withdraw: {
    submit: (reason: string) => Promise<boolean>;
    submitting: boolean;
    error: ActionError | null;
    clearError: () => void;
  };
};

/**
 * Gom dữ liệu và hành động của màn chi tiết hồ sơ để screen chỉ còn việc ghép
 * giao diện.
 *
 * Lịch sử xử lý được coi là dữ liệu phụ: hỏng thì chỉ phần dòng thời gian báo
 * lỗi chứ không chặn cả màn, vì hồ sơ và điều khoản vẫn đọc được.
 * Rút hồ sơ gửi đúng `version` mà backend vừa trả về; khi đụng xung đột version
 * hook không tự thử lại mà buộc tải lại bản mới.
 */
export function useApplicationDetail(applicationNumber: string): ApplicationDetailState {
  const applicationQuery = useGetApplicationQuery(applicationNumber);
  const historyQuery = useGetApplicationHistoryQuery({
    applicationNumber,
    page: 0,
    size: HISTORY_PAGE_SIZE,
  });
  const [withdrawApplication, withdrawState] = useWithdrawApplicationMutation();
  const [withdrawError, setWithdrawError] = useState<ActionError | null>(null);

  // Chỉ dò hợp đồng khi hồ sơ đã duyệt; các trạng thái khác chưa thể có hợp đồng.
  const approved = applicationQuery.data?.status === 'APPROVED';
  const contractsQuery = useListMyContractsQuery(
    { page: 0, size: CONTRACT_LOOKUP_SIZE },
    { skip: !approved },
  );

  const reload = () => {
    applicationQuery.refetch();
    historyQuery.refetch();
    if (approved) contractsQuery.refetch();
  };

  const application = applicationQuery.data ?? null;
  const showFinalTerms = application?.status === 'APPROVED'
    && application.finalAnnualInterestRate != null
    && application.finalCalculationSnapshot != null;
  const displayedSchedule = showFinalTerms
    ? application.finalCalculationSnapshot
    : application?.calculationSnapshot ?? null;

  const relatedContracts = (contractsQuery.data?.data ?? []).filter(
    item => item.applicationNumber === applicationNumber,
  );
  const contract =
    (relatedContracts.find(item => item.status === 'PENDING_SIGNATURE') ?? relatedContracts[0])
      ?? null;

  const view: ApplicationDetailView | null = application && displayedSchedule
    ? {
        application,
        displayedSchedule,
        status: applicationJourneyStatus(application.status, contract?.status),
        keyTerms: [
          { label: 'Số tiền vay', value: formatDong(application.requestedAmount) },
          { label: 'Kỳ hạn', value: `${application.requestedTermMonths} tháng` },
          {
            label: 'Lãi suất',
            value: formatAnnualRate(
              showFinalTerms && application.finalAnnualInterestRate != null
                ? application.finalAnnualInterestRate
                : application.productSnapshot.annualInterestRate,
            ),
          },
        ],
        timeline: buildApplicationTimeline(historyQuery.data?.data ?? [], application.status),
        timelineFailed: Boolean(historyQuery.error),
        canWithdraw: WITHDRAWABLE_STATUSES.includes(application.status),
        periodCount: displayedSchedule.periods?.length ?? 0,
        contract,
      }
    : null;

  const submitWithdraw = async (reason: string): Promise<boolean> => {
    if (!application) return false;
    setWithdrawError(null);
    try {
      await withdrawApplication({
        applicationNumber,
        version: application.version,
        reason: reason.trim() || undefined,
      }).unwrap();
      return true;
    } catch (error) {
      const mapped = toActionError(error);
      setWithdrawError(mapped);
      // Version cũ nghĩa là hồ sơ đã đổi trạng thái ở phía backend; nạp lại để
      // người dùng thấy tình trạng thật trước khi quyết định lần nữa.
      if (mapped.stale) reload();
      return false;
    }
  };

  return {
    // Chờ Contract khi hồ sơ đã APPROVED để không hiển thị thoáng qua trạng thái hồ sơ
    // cũ trước khi biết hợp đồng thực tế đã ký, từ chối hay hết hạn.
    loading: applicationQuery.isLoading || (approved && contractsQuery.isLoading),
    loadError:
      applicationQuery.error || (!applicationQuery.isLoading && !application)
        ? toLoadError(applicationQuery.error, 'Không tải được chi tiết hồ sơ vay.')
        : null,
    refreshing: applicationQuery.isFetching || historyQuery.isFetching || contractsQuery.isFetching,
    reload,
    view,
    withdraw: {
      submit: submitWithdraw,
      submitting: withdrawState.isLoading,
      error: withdrawError,
      clearError: () => setWithdrawError(null),
    },
  };
}
