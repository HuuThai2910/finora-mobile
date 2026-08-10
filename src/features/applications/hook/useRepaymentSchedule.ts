import type { SchedulePeriod } from '@/types/loan';
import { useGetApplicationQuery, useGetContractQuery } from '../api/applicationApi';
import { toLoadError } from '../mappers/apiError';

export type ScheduleSource = 'application' | 'contract';

export type ScheduleView = {
  /** Tiêu đề phụ cho biết đây là số dự kiến hay điều khoản đã chốt. */
  origin: 'estimate' | 'contract';
  number: string;
  periods: SchedulePeriod[];
  totalPrincipal: number;
  totalInterest: number;
  totalFees: number;
  totalRepayment: number;
  firstInstallment: number;
  maximumInstallment: number;
  expectedDisbursementDate: string;
};

export type RepaymentScheduleState = {
  loading: boolean;
  loadError: string | null;
  refreshing: boolean;
  reload: () => void;
  view: ScheduleView | null;
};

/**
 * Lịch trả đầy đủ dùng chung cho hồ sơ và hợp đồng.
 *
 * Màn này chỉ nhận định danh rồi đọc lại từ cache RTK Query của màn trước — đó
 * là lý do không truyền mảng kỳ trả qua tham số điều hướng. Hai truy vấn được
 * gọi cùng lúc nhưng chỉ một cái chạy thật nhờ `skip`, vì hook không được gọi
 * có điều kiện.
 */
export function useRepaymentSchedule(
  source: ScheduleSource,
  number: string,
): RepaymentScheduleState {
  const isApplication = source === 'application';
  const applicationQuery = useGetApplicationQuery(number, { skip: !isApplication });
  const contractQuery = useGetContractQuery(number, { skip: isApplication });
  const query = isApplication ? applicationQuery : contractQuery;

  let view: ScheduleView | null = null;

  if (isApplication && applicationQuery.data) {
    const application = applicationQuery.data;
    const snapshot = application.calculationSnapshot;
    view = {
      origin: 'estimate',
      number: application.applicationNumber,
      periods: snapshot.periods ?? [],
      totalPrincipal: snapshot.totalPrincipal,
      totalInterest: snapshot.totalInterest,
      totalFees: snapshot.totalFees,
      totalRepayment: snapshot.totalRepayment,
      firstInstallment: snapshot.firstInstallment,
      maximumInstallment: snapshot.maximumInstallment,
      expectedDisbursementDate: snapshot.expectedDisbursementDate,
    };
  } else if (!isApplication && contractQuery.data) {
    const contract = contractQuery.data;
    view = {
      origin: 'contract',
      number: contract.contractNumber,
      periods: contract.schedulePeriods ?? [],
      totalPrincipal: contract.principalAmount,
      totalInterest: contract.totalInterest,
      totalFees: contract.totalFees,
      totalRepayment: contract.totalRepayment,
      firstInstallment: contract.firstInstallment,
      maximumInstallment: contract.maximumInstallment,
      expectedDisbursementDate: contract.expectedDisbursementDate,
    };
  }

  return {
    loading: query.isLoading,
    loadError:
      query.error || (!query.isLoading && !view)
        ? toLoadError(query.error, 'Không tải được lịch trả nợ.')
        : null,
    refreshing: query.isFetching,
    reload: () => {
      query.refetch();
    },
    view,
  };
}
