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
  /** Chỉ có sau khi Loan đã phát hành hợp đồng chung cho allocation bị khóa. */
  contractNumber?: string | null;
  contractStatus?: string | null;
}

/**
 * Một vị thế trong danh mục: mọi Note của tôi trên cùng một khoản vay, gộp lại.
 * Tiền là số VND chỉ để hiển thị — backend đã tính, màn hình không tính lại để hạch toán.
 */
export interface PortfolioPosition {
  loanId: number;
  /** Đợt gọi vốn của khoản vay — mã sổ lệnh trên chợ Notes. */
  listingId: number;
  purpose: string | null;
  /** Bảng hạng là cấu hình động bên AI nên để chuỗi; thiếu thì null. */
  grade: string | null;
  /** Đã ở dạng phần trăm: 15 nghĩa là 15%/năm. */
  annualRate: number;
  termMonths: number;
  noteCount: number;
  /** Mệnh giá ban đầu của các Note. */
  principal: number;
  /** Dư nợ gốc còn lại — phần vốn còn nằm trong khoản vay. */
  outstanding: number;
  principalRepaid: number;
  interestReceived: number;
  /** Phần của tôi trong tổng vốn khoản vay, %. */
  sharePercent: number;
}

export interface PortfolioSummary {
  /** Vốn đang nằm trong các Note còn dư nợ. */
  investedAmount: number;
  /** Vốn đã cam kết nhưng khoản vay chưa giải ngân, chưa thành Note. */
  pendingAmount: number;
  principalRepaid: number;
  interestReceived: number;
  /** Gốc đã thu hồi cộng lãi đã nhận. */
  totalReceived: number;
  activeNoteCount: number;
  positionCount: number;
  /** Lãi suất bình quân theo dư nợ, %/năm — backend tính, không phải IRR. */
  averageRate: number;
  positions: PortfolioPosition[];
}

/**
 * Tiêu chí Auto-Invest. Hạng là chuỗi vì bảng hạng là cấu hình động bên AI
 * (admin thêm/xoá được), không cố định A–E như `CreditGrade`.
 */
export interface AutoInvestConfig {
  enabled: boolean;
  grades: string[];
  minAnnualRate: number;
  maxTermMonths: number;
  amountPerLoan: number;
}

/** Lý do Auto-Invest bỏ qua một khoản; mã do Investment Service trả về. */
export type AutoInvestSkipReason =
  | 'ALREADY_INVESTED'
  | 'BELOW_MINIMUM'
  | 'INSUFFICIENT_FUNDS'
  | 'LISTING_FULL'
  | 'LISTING_CLOSED'
  | (string & {});

export interface AutoInvestMatch {
  /** ISO-8601. */
  at: string;
  loanId: string;
  grade: string | null;
  annualRate: number | null;
  matched: boolean;
  amount?: number;
  reason?: AutoInvestSkipReason;
}

export type SignatureMethod = 'PASSWORD_OTP' | 'APP_CONFIRM';

export interface InvestmentContract {
  reference: string;
  purpose: string;
  amount: number;
  noteCount: number;
  termMonths: number;
  status: 'PENDING_SIGNATURE' | 'SIGNING' | 'SIGNED';
  contractStatus: string;
  version: number;
  documentHash: string;
  pdfDocumentHash: string;
  remainingLenderSignatures: number;
  availableSignatureProvider: 'MOCK' | 'VNPT_SMART_CA';
  availableSignatureMethod: 'CLICK_WRAP_MVP' | 'VNPT_SMART_CA';
  downloadPath: string;
  expiresAt: string;
}
