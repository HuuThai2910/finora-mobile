import { useRef, useState } from 'react';
import { ApiError, generateIdempotencyKey } from '@/lib/api';
import { usePinGuard } from '@/features/pin';
import type { CreateWithdrawalRequest, Withdrawal } from '@/types/wallet';
import { createWithdrawal } from '../api';
import { withdrawalSubmitError } from '../mappers/withdrawal';

export type CreateWithdrawalOutcome =
  | { kind: 'created'; withdrawal: Withdrawal }
  /** Người dùng đóng bảng PIN, hoặc đang có một lần gửi chạy: dừng lặng lẽ, không báo lỗi. */
  | { kind: 'cancelled' }
  | { kind: 'failed'; code: string | null };

/**
 * Gửi một lệnh rút có xác nhận PIN phạm vi `WITHDRAW`.
 *
 * `Idempotency-Key` được tạo trước khi hỏi PIN, vì token PIN chỉ mở đúng thao tác mang khoá đó (D38). Khoá gắn với
 * một ý định rút: cùng ngân hàng, số tài khoản, tên chủ tài khoản và số tiền. Gửi lại sau lỗi mạng, hết giờ chờ, PIN
 * sai hay bị chặn tạm thời thì giữ nguyên khoá, để Payment trả lại đúng lệnh cũ nếu đã tạo và không trừ ví lần hai;
 * đổi bất kỳ thông tin nào là ý định mới nên sinh khoá mới. Tạo thành công thì bỏ khoá: lần rút sau là lệnh mới.
 *
 * Cờ chống bấm lặp nằm ở ref vì hai lần chạm liên tiếp xảy ra trước khi state kịp cập nhật.
 */
export function useCreateWithdrawal() {
  const { requirePin } = usePinGuard();
  // Dấu vân tay chỉ nằm trong bộ nhớ của màn đang mở để so ý định; không ghi log, không lưu đi đâu.
  const intent = useRef<{ fingerprint: string; key: string } | null>(null);
  const running = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyFor = (request: CreateWithdrawalRequest): string => {
    const fingerprint = [request.amount, request.bankCode, request.accountNumber, request.accountHolderName].join('|');
    if (intent.current?.fingerprint !== fingerprint) {
      intent.current = { fingerprint, key: generateIdempotencyKey() };
    }
    return intent.current.key;
  };

  const submit = async (request: CreateWithdrawalRequest): Promise<CreateWithdrawalOutcome> => {
    if (running.current) return { kind: 'cancelled' };
    const key = keyFor(request);
    running.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const pinToken = await requirePin('WITHDRAW', key);
      if (!pinToken) return { kind: 'cancelled' };
      const withdrawal = await createWithdrawal(request, key, pinToken);
      intent.current = null;
      return { kind: 'created', withdrawal };
    } catch (e) {
      // Khoá đã đi cùng một nội dung khác (không nên xảy ra vì khoá theo đúng nội dung): bỏ khoá để lần sau là ý định mới.
      if (e instanceof ApiError && e.code === 'WITHDRAWAL_IDEMPOTENCY_CONFLICT') intent.current = null;
      setError(withdrawalSubmitError(e));
      return { kind: 'failed', code: e instanceof ApiError ? e.code : null };
    } finally {
      running.current = false;
      setSubmitting(false);
    }
  };

  return { submit, submitting, error, clearError: () => setError(null) };
}
