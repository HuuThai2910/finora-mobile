import { useMemo } from 'react';
import type { LoanContractSummary } from '@/types/contract';
import { useListMyApplicationsQuery, useListMyContractsQuery } from '../api/applicationApi';

/**
 * @param skip không tải (tài khoản nhà đầu tư không có hồ sơ vay; Trang chủ của họ không có mục hồ sơ).
 */
export const useMyApplications = ({ skip = false }: { skip?: boolean } = {}) => {
  const applications = useListMyApplicationsQuery({ page: 0, size: 20 }, { skip });
  const hasContractEligibleApplication = applications.data?.data.some(item =>
    item.status === 'APPROVED' && (
      item.termsConfirmation == null
      || item.termsConfirmation.status === 'AUTO_AUTHORIZED'
      || item.termsConfirmation.status === 'ACCEPTED'
    ) && (item.funding == null || item.funding.status === 'FULLY_FUNDED'
      || item.funding.status === 'CANCELLED')) ?? false;
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
    // Query đang bỏ qua thì chưa từng chạy, gọi refetch sẽ báo lỗi.
    if (skip) return;
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
