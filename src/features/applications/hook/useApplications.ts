import { useMemo } from 'react';
import type { LoanContractSummary } from '@/types/contract';
import { useListMyApplicationsQuery, useListMyContractsQuery } from '../api/applicationApi';

export const useMyApplications = () => {
  const applications = useListMyApplicationsQuery({ page: 0, size: 20 });
  const hasContractEligibleApplication = applications.data?.data.some(item =>
    item.status === 'APPROVED' && (
      item.termsConfirmation == null
      || item.termsConfirmation.status === 'AUTO_AUTHORIZED'
      || item.termsConfirmation.status === 'ACCEPTED'
    )) ?? false;
  const contracts = useListMyContractsQuery(
    { page: 0, size: 100 },
    { skip: !hasContractEligibleApplication },
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
    if (hasContractEligibleApplication) contracts.refetch();
  };

  return {
    data: applications.data?.data,
    totalElements: applications.data?.totalElements ?? 0,
    contractsByApplication,
    loading: applications.isLoading || (hasContractEligibleApplication && contracts.isLoading),
    refreshing: applications.isFetching || contracts.isFetching,
    error: applications.error ? 'Không thể tải danh sách hồ sơ vay.' : null,
    contractStatusUnavailable: Boolean(contracts.error),
    reload,
  };
};
