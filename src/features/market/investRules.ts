import type { MarketLoan } from '@/types/invest';
import { formatDong } from '@/utils/format';

/**
 * Luật đặt lệnh góp vốn phía app, chép đúng các điều kiện `requirePlaceable` của Investment
 * Service (đợt còn mở, chưa qua hạn, không dưới mức tối thiểu, chia hết mệnh giá Note, không vượt
 * phần còn thiếu) để báo lỗi ngay lúc gõ. Backend vẫn kiểm lại và là nơi quyết định cuối cùng.
 */

export type InvestBounds = {
  /** Lệnh nhỏ nhất: mức tối thiểu, làm tròn lên bội số mệnh giá. */
  min: number;
  /** Lệnh lớn nhất: phần còn thiếu, làm tròn xuống bội số mệnh giá. */
  max: number;
  /** Mệnh giá Note, cũng là bước của nút +/−. */
  step: number;
};

export function investBounds(loan: MarketLoan): InvestBounds {
  const step = loan.noteDenomination > 0 ? loan.noteDenomination : 1;
  return {
    min: Math.ceil(Math.max(loan.minInvestmentAmount, step) / step) * step,
    max: Math.floor(loan.remainingAmount / step) * step,
    step,
  };
}

/** Trạng thái hiển thị của đợt gọi vốn: đợt còn `OPEN` mà đã qua hạn thì coi như hết hạn. */
export type FundingState = 'OPEN' | 'EXPIRED' | 'FULLY_FUNDED' | 'CLOSED' | 'CANCELLED' | 'UNKNOWN';

export function fundingState(loan: MarketLoan, now: number = Date.now()): FundingState {
  if (loan.status !== 'OPEN') return loan.status;
  // Backend đóng đợt hết hạn theo lô định kỳ, nên có lúc đợt vẫn `OPEN` dù đã qua hạn
  // mà lệnh mới thì đã bị từ chối.
  const closesAt = loan.fundingClosesAt ? Date.parse(loan.fundingClosesAt) : Number.NaN;
  return Number.isFinite(closesAt) && closesAt <= now ? 'EXPIRED' : 'OPEN';
}

/** Lý do không đặt lệnh được nữa. */
export type InvestBlock = Exclude<FundingState, 'OPEN'> | 'BELOW_MINIMUM';

export function investBlock(state: FundingState, bounds: InvestBounds): InvestBlock | null {
  if (state !== 'OPEN') return state;
  // Phần còn thiếu nhỏ hơn mức tối thiểu: không còn số tiền nào thoả cả hai điều kiện.
  return bounds.max < bounds.min ? 'BELOW_MINIMUM' : null;
}

/** Lỗi đầu tiên mà backend sẽ trả cho số tiền này, theo đúng thứ tự backend kiểm. */
export function validateInvestAmount(amount: number, { min, max, step }: InvestBounds): string | null {
  if (!amount) return 'Nhập số tiền muốn đầu tư.';
  if (amount < min) return `Tối thiểu ${formatDong(min)}.`;
  if (amount % step !== 0) return `Số tiền phải là bội số của ${formatDong(step)}.`;
  if (amount > max) return `Khoản vay chỉ còn thiếu ${formatDong(max)}.`;
  return null;
}

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

/** Số tiền điền sẵn: mức `preferred`, làm tròn theo mệnh giá rồi kẹp vào khoảng đặt được. */
export function defaultInvestAmount(bounds: InvestBounds, preferred: number): number {
  if (bounds.max < bounds.min) return 0;
  return clamp(Math.floor(preferred / bounds.step) * bounds.step, bounds.min, bounds.max);
}

/** Mốc tròn quen thuộc khi nghĩ về số tiền: 1, 2, 5, 10, 20, 50… triệu. */
const PICK_LADDER = [1, 2, 5, 10, 20, 50, 100, 200, 500].map(million => million * 1_000_000);
/** Tối đa hai hàng ba nút, như lưới chọn nhanh của màn nạp tiền. */
const PICK_COUNT = 6;

/**
 * Mức chọn nhanh: mức tối thiểu, vài mốc tròn ở giữa (đều chia hết mệnh giá), cuối cùng là toàn
 * bộ phần còn thiếu. Khoảng đặt được chỉ có một giá trị thì không cần chọn nhanh.
 */
export function investQuickPicks({ min, max, step }: InvestBounds): number[] {
  if (max <= min) return [];
  const middle = PICK_LADDER.filter(value => value > min && value < max && value % step === 0);
  return [min, ...middle].slice(0, PICK_COUNT - 1).concat(max);
}

/**
 * Lãi dự kiến cả kỳ hạn trên số tiền góp, nếu người vay trả đúng lịch. Note nhận gốc lãi theo tỷ
 * lệ phần vốn nên tính thẳng trên số tiền góp, theo đúng cách trả nợ của khoản vay (r là lãi
 * suất tháng, n là số kỳ):
 * - `EQUAL_PRINCIPAL` (gốc đều, lãi trên dư nợ giảm dần): lãi = P × r × (n + 1) / 2.
 * - `ANNUITY` (trả góp đều): mỗi kỳ A = P × r / (1 − (1 + r)^−n), lãi = A × n − P.
 *
 * Chỉ để nhà đầu tư hình dung: lịch chính thức do Loan/Fineract lập lúc giải ngân (kỳ đầu lẻ
 * ngày, làm tròn) nên số thật có thể lệch đôi chút. Cách trả nợ lạ thì không đoán, trả `null`.
 */
export function expectedInterest(
  amount: number,
  loan: Pick<MarketLoan, 'annualRate' | 'termMonths' | 'repaymentMethod'>,
): number | null {
  const n = loan.termMonths;
  const r = loan.annualRate / 100 / 12;
  if (amount <= 0 || n <= 0) return null;
  switch (loan.repaymentMethod) {
    case 'EQUAL_PRINCIPAL':
      return Math.round((amount * r * (n + 1)) / 2);
    case 'ANNUITY': {
      if (r === 0) return 0;
      const installment = (amount * r) / (1 - Math.pow(1 + r, -n));
      return Math.round(installment * n - amount);
    }
    default:
      return null;
  }
}

export type InvestEstimate = {
  /** Số Note sẽ nhận, như backend tính: số tiền chia mệnh giá, làm tròn xuống. */
  notes: number;
  /** Phần của lệnh trong cả khoản vay, %. */
  sharePercent: number;
  interest: number | null;
};

export function estimateInvestment(amount: number, loan: MarketLoan): InvestEstimate {
  return {
    notes: loan.noteDenomination > 0 ? Math.floor(amount / loan.noteDenomination) : 0,
    sharePercent: loan.amount > 0 ? (amount / loan.amount) * 100 : 0,
    interest: expectedInterest(amount, loan),
  };
}

/** Số ngày còn lại tới `iso`, làm tròn lên: còn vài giờ vẫn là "còn 1 ngày". */
export function daysUntil(iso: string | null, now: number = Date.now()): number | null {
  const at = iso ? Date.parse(iso) : Number.NaN;
  return Number.isFinite(at) ? Math.ceil((at - now) / 86_400_000) : null;
}
