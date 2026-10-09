import type { CreditGrade } from '@/components/ui/ScoreRing';

/** Trạng thái đợt gọi vốn, khớp `ListingStatus` của Investment; giá trị lạ rơi về `UNKNOWN`. */
export type MarketListingStatus = 'OPEN' | 'FULLY_FUNDED' | 'CLOSED' | 'CANCELLED' | 'UNKNOWN';

export interface MarketLoan {
  /** Mã đợt gọi vốn (`listingId`) — lệnh góp vốn đặt theo mã này. */
  id: string;
  /** Số tiền cả khoản vay cần gọi. */
  amount: number;
  /** Phần vốn nhà đầu tư đã cam kết. */
  committedAmount: number;
  /** Phần còn thiếu: một lệnh không được vượt số này. */
  remainingAmount: number;
  annualRate: number;
  termMonths: number;
  /** Enum `repaymentMethod` của backend (`ANNUITY`, `EQUAL_PRINCIPAL`…), giữ nguyên chuỗi gốc. */
  repaymentMethod: string;
  purpose: string;
  /** Khu vực — người vay luôn ẩn danh trên sàn. */
  region: string;
  grade: CreditGrade;
  score: number;
  fundedPercent: number;
  /** Mệnh giá một Note: số tiền đặt lệnh phải là bội số của số này. */
  noteDenomination: number;
  /** Mức tối thiểu của một lệnh góp vốn. */
  minInvestmentAmount: number;
  status: MarketListingStatus;
  /** ISO-8601; qua mốc này backend không nhận lệnh mới dù đợt chưa kịp đóng. */
  fundingClosesAt: string | null;
  /** Chỉ có sau khi Loan đã phát hành hợp đồng chung cho allocation bị khóa. */
  contractNumber?: string | null;
  contractStatus?: string | null;
  /**
   * Mã hồ sơ vay (public ID của Loan) để tải hồ sơ người vay; `null` khi backend chưa trả mã này
   * (bản cũ), lúc đó màn hình không hiện thẻ hồ sơ người vay.
   */
  applicationNumber: string | null;
}

/* ---------- Hồ sơ người vay cho nhà đầu tư (Loan Service) ---------- */

/** `BorrowerKycStatus` của Loan; giá trị lạ rơi về `UNKNOWN`. */
export type BorrowerKycStatus = 'VERIFIED' | 'PENDING' | 'PROCESSING' | 'REJECTED' | 'EXPIRED' | 'UNKNOWN';

/** Ai ra quyết định duyệt hồ sơ: chính sách tín dụng tự động hay chuyên viên thẩm định. */
export type LoanDecisionSource = 'AI_POLICY' | 'ADMIN' | 'UNKNOWN';

/** Một luật đã chấm, đúng thứ tự AI trả về. */
export interface BorrowerRuleResult {
  code: string;
  description: string;
  /** Mã trường luật đã đọc trong danh mục trường của AI, ví dụ `cic_score`. */
  field: string;
  /** Giá trị luật đọc được; `null` khi luật thiếu dữ liệu. */
  value: number | string | null;
  points: number | null;
  maxPoints: number | null;
  weight: number | null;
  missingData: boolean;
}

/**
 * Hồ sơ người vay nhà đầu tư xem trước khi góp vốn: ẩn danh (không họ tên, CCCD, liên hệ, địa chỉ)
 * và không có giải thích SHAP. Số liệu là bản chụp lúc nộp hồ sơ và lúc chấm điểm; app chỉ hiển thị.
 */
export interface BorrowerProfile {
  applicationNumber: string;
  loan: {
    purposeLabel: string;
    /** Phương án sử dụng vốn người vay tự viết; `null` khi bỏ trống. */
    purposeDetail: string | null;
    requestedAmount: number;
    termMonths: number;
    repaymentMethod: string;
    /** Điểm phần trăm/năm, ví dụ 15,5. */
    finalAnnualRate: number | null;
    firstInstallment: number | null;
    maximumInstallment: number | null;
    totalRepayment: number | null;
    /** `yyyy-MM-dd`. */
    expectedDisbursementDate: string | null;
  };
  capacity: {
    monthlyIncome: number;
    monthlyDebt: number;
    /** Đã là phần trăm: 5 nghĩa là 5%. */
    dtiPercent: number;
    employmentMonths: number | null;
    selfDeclared: boolean;
    capturedAt: string | null;
  };
  background: {
    age: number | null;
    kycStatus: BorrowerKycStatus | null;
    /** Tuổi/eKYC lấy từ hồ sơ giả lập của môi trường thử nghiệm, chưa đọc từ User Service. */
    mockProfile: boolean;
    homeOwnership: string | null;
    educationLevel: string | null;
  };
  /** Lịch sử vay tại FINORA (không phải CIC); `null` khi chưa có dữ liệu. */
  creditHistory: {
    hasHistory: boolean;
    completedLoans: number;
    delinquenciesLast2Years: number;
    defaultedLoans: number;
  } | null;
  /** `null` khi hồ sơ chưa có lần chấm điểm thành công. */
  assessment: {
    evaluationScore: number | null;
    grade: string | null;
    /** Xác suất vỡ nợ theo phần trăm: 35,68 nghĩa là 35,68%. */
    pdPercent: number | null;
    /** Điểm theo bảng luật, thang 0–100. */
    ruleScore: number | null;
    decisionSource: LoanDecisionSource | null;
    scoredAt: string | null;
  } | null;
  rules: BorrowerRuleResult[];
}

/** Trạng thái lệnh góp vốn, khớp `OrderStatus` của Investment; giá trị lạ rơi về `UNKNOWN`. */
export type InvestOrderStatus = 'PENDING_FUNDS' | 'COMMITTED' | 'REJECTED' | 'CANCELLED' | 'UNKNOWN';

/**
 * Kết quả một lệnh góp vốn. Backend trả 201 cả khi lệnh bị từ chối (ví không giữ được tiền,
 * khoản vay vừa đủ vốn…), nên màn hình phải đọc `status` chứ không coi mọi phản hồi là thành công.
 */
export interface InvestOrderResult {
  orderReference: string;
  amount: number;
  status: InvestOrderStatus;
  /** Mã lý do khi bị từ chối, ví dụ `PAYMENT_INSUFFICIENT_BALANCE`. */
  rejectedReasonCode: string | null;
  rejectedReasonDetail: string | null;
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
  /** Projection vận hành từ Loan; không thay đổi điều khoản Note đã phát hành. */
  daysPastDue: number;
  debtGroup: number;
  overdueAmount: number;
  servicingStatus: string;
  maturityDate: string | null;
  riskDataAsOf: string | null;
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
