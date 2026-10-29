import { formatPercentValue } from '@/utils/format';
import type { FinancialRow } from '../components/FinancialRows';

/** Biểu phí Payment dùng cho hợp đồng không quy định phí trả trước (hợp đồng ký trước 16/10/2026). */
export const NO_FEE_DISCLOSED = 'NO_FEE_DISCLOSED';

type FeeQuote = {
  feeRate: number;
  platformFee: number;
  investorFeeShare: number;
  finoraFeeShare: number;
  policyVersion: string;
};

/**
 * Các dòng phí của báo giá trả trước/tất toán. Tỷ lệ chia lấy từ chính số tiền backend trả về, không ghi cứng 80/20:
 * mỗi khoản vay tính theo biểu phí trong hợp đồng của nó (G-POLICY), nên app chỉ hiển thị đúng breakdown đã tính.
 */
export function feeRows(label: string, quote: FeeQuote): FinancialRow[] {
  if (quote.platformFee <= 0) return [{ label, value: 0 }];
  const share = (part: number) => formatPercentValue((part / quote.platformFee) * 100, 0);
  return [
    { label: `${label} (${formatPercentValue(quote.feeRate * 100)})`, value: quote.platformFee },
    { label: `Phần bù cho nhà đầu tư (${share(quote.investorFeeShare)})`, value: quote.investorFeeShare },
    { label: `Phí dịch vụ FINORA (${share(quote.finoraFeeShare)})`, value: quote.finoraFeeShare },
  ];
}

/** Câu giải thích phí theo biểu phí của chính hợp đồng. */
export function feePolicyNote(policyVersion: string): string {
  return policyVersion === NO_FEE_DISCLOSED
    ? 'Hợp đồng của bạn không quy định phí trả trước nên FINORA không thu phí này.'
    : 'Phí được tính theo biểu phí ghi trong hợp đồng của bạn.';
}
