import { useRef, useState } from 'react';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import { useEkycGate } from '@/features/ekyc';
import { usePinGuard } from '@/features/pin';
import type { InvestOrderResult, MarketLoan } from '@/types/invest';
import { invest } from '../api';
import { DEFAULT_INVEST_AMOUNT, RISK_DISCLOSURE_VERSION } from '../constant';
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
  // Nhà đầu tư phải tự tick xác nhận rủi ro cho từng lần đặt lệnh; không lưu sẵn trạng thái đã đồng ý.
  const [riskAccepted, setRiskAccepted] = useState(false);
  const idempotencyKey = useRef(generateIdempotencyKey());
  const { requirePin } = usePinGuard();
  const ekyc = useEkycGate('đầu tư');

  const error = validateInvestAmount(amount, bounds);

  const change = (next: number) => {
    if (next !== amount) idempotencyKey.current = generateIdempotencyKey();
    setAmount(next);
    setSubmitError(null);
  };

  const submit = async () => {
    if (error || submitting || !riskAccepted) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Chưa định danh thì báo ngay, không bắt nhập PIN cho một lệnh chắc chắn bị từ chối.
      if (!(await ekyc.ensureVerified())) return;
      // Đóng bảng PIN là thôi đặt lệnh: không báo lỗi, giữ nguyên khoá cho lần bấm sau.
      const key = idempotencyKey.current;
      const pinToken = await requirePin('INVEST', key);
      if (!pinToken) return;
      // Token PIN gắn với khoá lệnh, nên gửi lại sau khi làm mới phiên (claim eKYC cũ) vẫn dùng được.
      const order = await ekyc.run(() => invest(loan.id, amount, key, pinToken, RISK_DISCLOSURE_VERSION));
      if (!order) return;
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
    riskAccepted,
    setRiskAccepted,
    submitting,
    submitError,
    result,
    /** Trạng thái định danh: chưa duyệt thì màn thay ô nhập bằng lời báo eKYC. */
    ekyc,
    /** Rời màn kết quả để đặt lại (sau khi bị từ chối): xoá kết quả, giữ số tiền đã nhập. */
    clearResult: () => setResult(null),
  };
}
