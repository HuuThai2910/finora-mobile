import { useAsync } from '@/hooks/useAsync';
import { getVentoPackage, listVentoPackages } from '../api';
import { useGetProductQuery, useListProductsQuery, useListPurposesQuery } from '../api/productApi';

function queryError(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return 'Không thể tải dữ liệu khoản vay. Vui lòng kiểm tra kết nối.';
}

export const useProducts = () => {
  const query = useListProductsQuery({ page: 0, size: 20 });
  return {
    data: query.data?.data,
    loading: query.isLoading,
    error: queryError(query.error),
    reload: query.refetch,
  };
};

export const useProduct = (id: number) => {
  const query = useGetProductQuery(id);
  return { data: query.data, loading: query.isLoading, error: queryError(query.error), reload: query.refetch };
};

export const usePurposes = () => {
  const query = useListPurposesQuery();
  return { data: query.data, loading: query.isLoading, error: queryError(query.error), reload: query.refetch };
};
export const useVentoPackages = () => useAsync(listVentoPackages, []);
export const useVentoPackage = (code: string) => useAsync(getVentoPackage, [code]);
