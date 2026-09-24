import type { CreditGrade } from '@/components/ui/ScoreRing';

export interface MarketLoan {
  id: string;
  amount: number;
  annualRate: number;
  termMonths: number;
  purpose: string;
  /** Khu vực — người vay luôn ẩn danh trên sàn. */
  region: string;
  grade: CreditGrade;
  score: number;
  fundedPercent: number;
  borrowerHistory: string;
  /** Ước tính dòng tiền nhận về, đã tính sẵn ở phía phát hành. */
  estimatedMonthlyReturn: number;
  estimatedTotalReturn: number;
}

export type PositionStatus = 'ACTIVE' | 'WATCHLIST' | 'FUNDED' | 'CLOSED';

export interface PortfolioPosition {
  loanId: string;
  sharePercent: number;
  status: PositionStatus;
  /** Ghi chú dòng dưới, ví dụ "Kỳ 7 nhận +842.500 đ · 11/07". */
  note?: string;
  lastCashflow?: number;
}

export interface PortfolioSummary {
  investedAmount: number;
  irrPercent: number;
  /** Chưa có số liệu thì để `null`; màn hình hiện dấu gạch thay vì khẳng định 0%. */
  nplPercent: number | null;
  positionCount: number;
  positions: PortfolioPosition[];
}

export interface AutoInvestConfig {
  enabled: boolean;
  grades: CreditGrade[];
  minAnnualRate: number;
  maxTermMonths: number;
  amountPerLoan: number;
  maxPortfolioSharePercent: number;
}

export interface AutoInvestMatch {
  at: string;
  loanId: string;
  grade: CreditGrade;
  annualRate: number;
  matched: boolean;
  amount?: number;
}

export type SignatureMethod = 'PASSWORD_OTP' | 'APP_CONFIRM';

export interface InvestmentContract {
  reference: string;
  purpose: string;
  amount: number;
  noteCount: number;
  termMonths: number;
  status: 'PENDING_SIGNATURE' | 'SIGNED';
}

export type NoteListingStatus = 'OPEN' | 'SOLD' | 'CANCELLED';

/**
 * Một Note đang được treo bán trên chợ thứ cấp.
 *
 * `defaulted` phải hiển thị rõ ở cả màn đăng bán và màn xác nhận mua: bán Note thuộc khoản vay
 * đang nợ xấu là hợp lệ, nhưng người mua cần biết trước khi quyết định.
 */
export interface NoteListing {
  reference: string;
  noteNumber: string;
  loanId: string;
  sellerId: string;

  /** Giá người bán treo. Luôn không vượt dư nợ gốc — backend chặn. */
  askingPrice: number;
  outstandingPrincipal: number;

  defaulted: boolean;
  defaultedReason: string | null;

  annualRate: number;
  termMonths: number;
  grade: CreditGrade | null;

  /** Phí và tiền thực nhận nếu bán ở giá đang treo; backend tính, frontend chỉ hiển thị. */
  estimatedFee: number;
  estimatedProceeds: number;

  status: NoteListingStatus;
  buyerId: string | null;
  soldPrice: number | null;
  platformFee: number | null;
  sellerProceeds: number | null;
}

/** Một Note trong danh mục, để chọn ra khi muốn treo bán. */
export interface OwnedNote {
  noteNumber: string;
  loanId: string;
  outstandingPrincipal: number;
  annualRate: number;
  termMonths: number;
  status: 'ACTIVE' | 'CLOSED' | 'DEFAULTED';
}
