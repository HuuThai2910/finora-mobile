import { useAsync, type AsyncState } from '@/hooks/useAsync';
import type { RepaymentPreview, RepaymentPreviewRequest } from '@/types/loan';
import { getRepaymentPreview } from '../api';

/**
 * Lịch trả dự kiến của bước 2/3, tính bởi backend qua
 * `POST /loan-products/{productId}/repayment-previews` (nhánh mock khi miền
 * `products` bật mock).
 *
 * - Input: Product và ba giá trị người vay chọn ở bước 1 (số tiền, kỳ hạn, ngày
 *   giải ngân dự kiến) — đúng params của route `Schedule`.
 * - Output: `{ data, loading, error, reload }` của `useAsync`; `reload` gửi lại
 *   đúng request cũ, lựa chọn ở bước 1 không đổi.
 * - Gọi lại mỗi khi một trong bốn giá trị đổi; bỏ kết quả của request cũ nếu màn
 *   đã rời đi (việc này `useAsync` lo).
 * - Frontend không tự tính hay làm tròn lại số nào: preview là số của core lending.
 */
export function useRepaymentPreview(
  productId: number,
  request: RepaymentPreviewRequest,
): AsyncState<RepaymentPreview> {
  const { amount, termMonths, expectedDisbursementDate } = request;
  return useAsync(
    () => getRepaymentPreview(productId, { amount, termMonths, expectedDisbursementDate }),
    [productId, amount, termMonths, expectedDisbursementDate],
  );
}
