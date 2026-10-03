import { useCallback, useRef, useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import type { BookOrder, PlaceOrderInput } from '@/types/orderBook';
import { cancelBookOrder, getMyPosition, listMyOrders, listOrderBooks, placeBookOrder } from '../api';

/** Danh sách khoản vay còn Note lưu hành. */
export const useOrderBooks = () => useAsync(signal => listOrderBooks(signal), []);

/** Vị thế của tôi trên một sổ: Note rảnh, Note đang bán, lệnh còn hiệu lực. */
export const useMyPosition = (listingId: number) =>
  useAsync(signal => getMyPosition(listingId, signal), [listingId]);

export const useMyOrders = (activeOnly: boolean) =>
  useAsync(signal => listMyOrders(activeOnly, signal), [activeOnly]);

/**
 * Đặt lệnh, chống bấm lặp và giữ đúng một `Idempotency-Key` cho cùng một ý định.
 *
 * Khóa chỉ đổi khi nội dung lệnh đổi: gửi lại y nguyên sau lỗi mạng dùng khóa cũ nên backend trả
 * về lệnh đã đặt thay vì giữ tiền lần hai; sửa giá hay số Note là một lệnh mới, cần khóa mới.
 */
export function usePlaceOrder(listingId: number) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intent = useRef<{ fingerprint: string; key: string } | null>(null);

  const submit = useCallback(
    async (input: PlaceOrderInput): Promise<BookOrder | null> => {
      const fingerprint = `${input.side}|${input.price.toFixed(1)}|${input.quantity}|${input.acknowledgeDefault}`;
      if (intent.current?.fingerprint !== fingerprint) {
        intent.current = { fingerprint, key: generateIdempotencyKey() };
      }
      setSubmitting(true);
      setError(null);
      try {
        const order = await placeBookOrder(listingId, input, intent.current.key);
        // Đã thành: lần bấm sau — kể cả cùng nội dung — là một lệnh mới, cần khóa mới.
        intent.current = null;
        return order;
      } catch (e) {
        setError(toUserMessage(e));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [listingId],
  );

  return { submit, submitting, error, clearError: () => setError(null) };
}

/** Huỷ lệnh; nhớ lệnh nào đang huỷ để chỉ khóa đúng nút đó. */
export function useCancelOrder(onDone: (order: BookOrder) => void) {
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(
    async (reference: string) => {
      setCancelling(reference);
      setError(null);
      try {
        onDone(await cancelBookOrder(reference));
      } catch (e) {
        setError(toUserMessage(e));
      } finally {
        setCancelling(null);
      }
    },
    [onDone],
  );

  return { cancel, cancelling, error };
}
