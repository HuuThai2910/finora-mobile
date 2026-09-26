import { useState } from 'react';
import type { LoanProductCatalog } from '@/types/loan';
import type { MarketStackParamList } from '@/navigation/types';
import { DEFAULT_LOAN_AMOUNT, defaultDisbursementDate } from '../constant';
import { validateAmount, validateDisbursementDate } from '../schemas/loanSelection';

/** Trường có thể sai ở bước 1; kỳ hạn luôn hợp lệ vì chỉ chọn được trong biên. */
export type LoanSelectionField = 'amount' | 'date';

export type LoanSelectionSubmit =
  | { ok: true; params: MarketStackParamList['Schedule'] }
  | { ok: false; field: LoanSelectionField; message: string };

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Lựa chọn khoản vay ở bước 1/3: số tiền, kỳ hạn, ngày giải ngân dự kiến và lỗi
 * của từng trường.
 *
 * - Input: Product đang mở (`undefined` khi còn tải hoặc lỗi).
 * - Output: giá trị + hàm đổi cho từng trường, và `submit` kiểm tra cả hai trường
 *   một lần; hợp lệ thì trả đúng params của `Schedule`, sai thì trả trường sai đầu
 *   tiên để màn cuộn tới.
 * - State để cục bộ (không đưa vào Redux): nó chỉ sống tới khi sang bước 2, và
 *   hai bước sau nhận lại đúng bốn giá trị qua params.
 * - Không side effect, không gọi API.
 */
export function useLoanSelection(product: LoanProductCatalog | undefined) {
  const [productId, setProductId] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);
  const [termMonths, setTermMonths] = useState(0);
  const [disbursementDate, setDisbursementDate] = useState(defaultDisbursementDate);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Mỗi Product có biên riêng nên mở Product khác thì khởi tạo lại lựa chọn. Làm
  // ngay trong lúc render (cách React khuyên thay cho effect) để ô số tiền không
  // hiện "0 đ" một nhịp trước khi effect kịp chạy.
  if (product && productId !== product.id) {
    setProductId(product.id);
    setAmount(clamp(DEFAULT_LOAN_AMOUNT, product.minAmount, product.maxAmount));
    setTermMonths(product.minTermMonths);
    setDisbursementDate(defaultDisbursementDate());
    setAmountError(null);
    setDateError(null);
  }

  const changeAmount = (value: number) => {
    setAmount(value);
    setAmountError(null);
  };

  const changeDisbursementDate = (value: string) => {
    setDisbursementDate(value);
    setDateError(null);
  };

  /** Chưa có Product thì trả `null` — nút "Tiếp tục" đang bị khoá nên không xảy ra. */
  const submit = (): LoanSelectionSubmit | null => {
    if (!product) return null;
    const nextAmountError = validateAmount(amount, product.minAmount, product.maxAmount);
    const nextDateError = validateDisbursementDate(disbursementDate);
    setAmountError(nextAmountError);
    setDateError(nextDateError);

    if (nextAmountError) return { ok: false, field: 'amount', message: nextAmountError };
    if (nextDateError) return { ok: false, field: 'date', message: nextDateError };
    return {
      ok: true,
      params: {
        productId: product.id,
        amount,
        termMonths,
        expectedDisbursementDate: disbursementDate,
      },
    };
  };

  return {
    amount,
    termMonths,
    disbursementDate,
    amountError,
    dateError,
    changeAmount,
    changeTermMonths: setTermMonths,
    changeDisbursementDate,
    submit,
  };
}
