import { isMocked } from '@/lib/mockFlag';
import * as catalogMock from '@/lib/mocks/catalog';
import { apiFetch } from '@/lib/api';
import type {
  LoanProductCatalog,
  LoanPurpose,
  PageResponse,
  RepaymentPreview,
  RepaymentPreviewRequest,
} from '@/types/loan';

/**
 * Đây là miền đã có backend thật (`finora-loan`). Nhánh mock chỉ để chạy
 * demo khi chưa dựng được service.
 */

export const listProducts = async (): Promise<LoanProductCatalog[]> => {
  if (isMocked('products')) return catalogMock.listProducts();
  const page = await apiFetch<PageResponse<LoanProductCatalog>>('/loan-products?page=0&size=50');
  return page.data;
};

export const getProduct = async (id: number): Promise<LoanProductCatalog> => {
  if (isMocked('products')) {
    const all = await catalogMock.listProducts();
    const found = all.find(p => p.id === id);
    if (!found) throw new Error(`Không có sản phẩm ${id}`);
    return found;
  }
  return apiFetch<LoanProductCatalog>(`/loan-products/${id}`);
};

export const listPurposes = (): Promise<LoanPurpose[]> =>
  isMocked('products') ? catalogMock.listPurposes() : apiFetch<LoanPurpose[]>('/loan-purposes');

export const getRepaymentPreview = (
  productId: number,
  body: RepaymentPreviewRequest,
): Promise<RepaymentPreview> =>
  isMocked('products')
    ? catalogMock.getPreview()
    : apiFetch<RepaymentPreview>(`/loan-products/${productId}/repayment-previews`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

/** Gói vay ưu đãi là khái niệm chỉ có trong bản demo VENTO, không có ở backend. */
export const listVentoPackages = () => catalogMock.listVentoPackages();
export const getVentoPackage = () => catalogMock.getVentoPackage();
