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
  nplPercent: number;
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
