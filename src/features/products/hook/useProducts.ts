import { useAsync } from '@/hooks/useAsync';
import { getProduct, getVentoPackage, listProducts, listVentoPackages, listPurposes } from '../api';

export const useProducts = () => useAsync(listProducts, []);
export const useProduct = (id: number) => useAsync(() => getProduct(id), [id]);
export const usePurposes = () => useAsync(listPurposes, []);
export const useVentoPackages = () => useAsync(listVentoPackages, []);
export const useVentoPackage = (code: string) => useAsync(getVentoPackage, [code]);
