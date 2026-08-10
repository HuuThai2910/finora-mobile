import { useListMyApplicationsQuery } from '../api/applicationApi';

export const useMyApplications = () => {
  const query = useListMyApplicationsQuery({ page: 0, size: 20 });
  const message = query.error ? 'Không thể tải danh sách hồ sơ vay.' : null;
  return { data: query.data?.data, loading: query.isLoading, error: message, reload: query.refetch };
};
