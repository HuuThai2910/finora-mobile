import { useAsync } from '@/hooks/useAsync';
import { listMyListings, listSecondaryListings } from '../api';

/** Bảng tin: các Note đang được treo bán. */
export const useSecondaryListings = () => useAsync(listSecondaryListings, []);

/** Tin đăng bán của chính người đang đăng nhập. */
export const useMyListings = () => useAsync(listMyListings, []);
