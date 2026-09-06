import { useMemo } from 'react';
import type { LoanContractSummary } from '@/types/contract';
import { useListMyApplicationsQuery, useListMyContractsQuery } from '../api/applicationApi';

export const useMyApplications = () => {
  const applications = useListMyApplicationsQuery({ page: 0, size: 20 });
  const hasApprovedApplication = applications.data?.data.some(item => item.status === 'APPROVED') ?? false;
  const contracts = useListMyContractsQuery(
    { page: 0, size: 100 },
    { skip: !hasApprovedApplication },
  );

  /**
   * Loan Service giữ trạng thái Application và Contract tách biệt. Ghép một
   * page Contract duy nhất theo applicationNumber, không gọi API trong từng
   * thẻ nên tránh N+1 khi danh sách có nhiều hồ sơ đã duyệt.
   */
  const contractsByApplication = useMemo(() => {
    const result = new Map<string, LoanContractSummary>();
    for (const contract of contracts.data?.data ?? []) {
      if (!result.has(contract.applicationNumber)) {
        result.set(contract.applicationNumber, contract);
      }
    }
    return result as ReadonlyMap<string, LoanContractSummary>;
  }, [contracts.data]);

  const reload = () => {
    applications.refetch();
    if (hasApprovedApplication) contracts.refetch();
  };

  return {
    data: applications.data?.data,
    totalElements: applications.data?.totalElements ?? 0,
    contractsByApplication,
    loading: applications.isLoading || (hasApprovedApplication && contracts.isLoading),
    refreshing: applications.isFetching || contracts.isFetching,
    error: applications.error ? 'Không thể tải danh sách hồ sơ vay.' : null,
    contractStatusUnavailable: Boolean(contracts.error),
    reload,
  };
};
