import { useRef, useState } from 'react';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import { usePinGuard } from '@/features/pin';
import type { InvestOrderResult, MarketLoan } from '@/types/invest';
import { invest } from '../api';
import { DEFAULT_INVEST_AMOUNT } from '../constant';
import { readableAmounts } from '../mapper';
import {
  defaultInvestAmount,
  estimateInvestment,
  investBounds,
  investQuickPicks,
  validateInvestAmount,
} from '../investRules';

/**
 * Phần góp vốn của màn chi tiết khoản vay: số tiền đang nhập, lỗi theo đúng luật backend, số tạm
 * tính và lời gọi đặt lệnh có hỏi PIN. State nằm cục bộ ở màn vì chỉ màn này dùng.
 *
 * Khoá idempotency gắn với một ý định đặt lệnh. Bấm lại sau lỗi mạng hay khi ví chưa phản hồi thì
 * giữ nguyên khoá, để backend nhận ra lệnh cũ và không giữ tiền lần hai. Đổi số tiền, hoặc lệnh đã
 * có kết quả cuối (đã giữ tiền, bị từ chối) thì sinh khoá mới: backend trả lỗi nếu khoá cũ đi với
 * số tiền khác, còn gửi lại khoá của lệnh đã xong chỉ nhận về đúng kết quả cũ.
 */
export function useInvestForm(loan: MarketLoan) {
  const bounds = investBounds(loan);
  const [amount, setAmount] = useState(() => defaultInvestAmount(bounds, DEFAULT_INVEST_AMOUNT));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<InvestOrderResult | null>(null);
  const idempotencyKey = useRef(generateIdempotencyKey());
  const { requirePin } = usePinGuard();

  const error = validateInvestAmount(amount, bounds);

  const change = (next: number) => {
    if (next !== amount) idempotencyKey.current = generateIdempotencyKey();
    setAmount(next);
    setSubmitError(null);
  };

  const submit = async () => {
    if (error || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Đóng bảng PIN là thôi đặt lệnh: không báo lỗi, giữ nguyên khoá cho lần bấm sau.
      const pinToken = await requirePin('INVEST');
      if (!pinToken) return;
      const order = await invest(loan.id, amount, idempotencyKey.current, pinToken);
      if (order.status !== 'PENDING_FUNDS') idempotencyKey.current = generateIdempotencyKey();
      setResult(order);
    } catch (e) {
      setSubmitError(readableAmounts(toUserMessage(e)));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    amount,
    bounds,
    error,
    picks: investQuickPicks(bounds),
    estimate: error ? null : estimateInvestment(amount, loan),
    change,
    submit,
    submitting,
    submitError,
    result,
    /** Rời màn kết quả để đặt lại (sau khi bị từ chối): xoá kết quả, giữ số tiền đã nhập. */
    clearResult: () => setResult(null),
  };
}
