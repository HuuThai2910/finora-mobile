import { formatPercentValue } from '@/utils/format';
import type { FinancialRow } from '../components/FinancialRows';

type FeeQuote = {
  feeRate: number;
  platformFee: number;
};

/**
 * Dòng phí của báo giá trả trước/tất toán: chỉ tổng phí kèm tỷ lệ theo biểu phí trong hợp đồng (G-POLICY). Không
 * tách phần bù cho nhà đầu tư và phí dịch vụ FINORA: người vay chỉ cần biết mình trả bao nhiêu, cách chia phí giữa
 * các bên là chuyện nội bộ và dễ gây khó hiểu.
 */
export function feeRows(label: string, quote: FeeQuote): FinancialRow[] {
  if (quote.platformFee <= 0) return [{ label, value: 0 }];
  return [{ label: `${label} (${formatPercentValue(quote.feeRate * 100)})`, value: quote.platformFee }];
}
