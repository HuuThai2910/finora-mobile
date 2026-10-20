import type { SchedulePeriod } from '@/types/loan';

export type ServicingLoanStatus = 'ACTIVE' | 'RESTRUCTURING' | 'SETTLED' | 'DEFAULTED' | 'WRITTEN_OFF';

export interface ServicingLoanSummary {
  loanNumber: string;
  applicationNumber: string;
  contractNumber: string;
  status: ServicingLoanStatus;
  principalAmount: number;
  principalOutstanding: number;
  totalOutstanding: number;
  overdueAmount: number;
  daysPastDue: number;
  nextDueDate: string | null;
  nextDueAmount: number;
  maturityDate: string;
  currency: string;
  source: string;
  dataAsOf: string;
  lastSyncedAt: string;
  stale: boolean;
}

export interface ServicingSchedule {
  loan: ServicingLoanSummary;
  periods: SchedulePeriod[];
  scheduleSource: string;
  dataAsOf: string;
  stale: boolean;
}

export type RepaymentType = 'SCHEDULED' | 'OVERDUE_CURE' | 'PARTIAL_PREPAYMENT' | 'EARLY_SETTLEMENT';

/**
 * Nghĩa vụ phải trả ngay lúc này do Payment đọc từ Fineract — đúng số mà lệnh trả nợ sẽ kiểm. Màn hình hiển thị và
 * gửi lại nguyên `amount`, không tự cộng từ projection (có thể cũ, và Fineract làm tròn kỳ theo bội 1.000 VND).
 */
export interface ScheduledDue {
  loanApplicationId: number;
  amount: number;
  /** Phần quá hạn nằm trong `amount`; lớn hơn 0 thì lệnh là khắc phục quá hạn và `amount` là toàn bộ phần quá hạn. */
  overdueAmount: number;
  /**
   * Quá hạn nhiều kỳ: số tiền của riêng kỳ quá hạn cũ nhất, người vay được chọn trả bớt thay cho `amount` (D26).
   * Khoản vay vẫn quá hạn sau lượt trả này. `null` khi không áp dụng.
   */
  partialOverdueAmount: number | null;
  currency: string;
  repaymentType: RepaymentType;
  /** Ngày nghiệp vụ Việt Nam (YYYY-MM-DD) của báo giá; sang ngày khác phải đọc lại. */
  businessDate: string;
  /** Ngày đến hạn của kỳ mà `amount` thanh toán. */
  dueDate: string | null;
  /**
   * Trả ngay bây giờ thì khoản tiền được ghi vào sổ nợ ngày này: trả kỳ trước hạn trên khoản vay tính lãi theo ngày
   * (D16). Tiền rời ví hôm nay nhưng lãi của kỳ giữ nguyên theo lịch. `null` là ghi ngay.
   */
  postOn: string | null;
  /** Khoản đã thu nhưng chưa ghi xong vào sổ nợ; khác `null` thì chưa trả thêm được cho kỳ này. */
  pending: PendingRepayment | null;
}

export interface PendingRepayment {
  repaymentId: string;
  amount: number;
  status: RepaymentStatus;
  /** Ngày ghi nhận đã hẹn của khoản trả kỳ trước hạn; `null` là khoản đang được ghi ngay. */
  postOn: string | null;
  /** Còn hủy được (trước ngày ghi nhận); hủy thì tiền hoàn về ví. */
  cancellable: boolean;
}

export type RepaymentStatus =
  | 'COLLECTED'
  | 'CORE_POSTING'
  | 'CORE_POSTED'
  | 'COMPLETED'
  | 'RECONCILIATION_REQUIRED'
  | 'FAILED'
  | 'CANCELLED';

export interface RepaymentResult {
  repaymentId: string;
  loanApplicationId: number;
  repaymentType: RepaymentType;
  quoteId: string | null;
  partialPrepaymentQuoteId: string | null;
  amount: number;
  coreAmount: number;
  platformFee: number;
  investorFeeShare: number;
  finoraFeeShare: number;
  currency: string;
  transactionDate: string;
  status: RepaymentStatus;
  fineractTransactionId: number | null;
  principalAmount: number | null;
  interestAmount: number | null;
  feeAmount: number | null;
  penaltyAmount: number | null;
  outstandingPrincipal: number | null;
  outstandingInterest: number | null;
  outstandingFee: number | null;
  outstandingPenalty: number | null;
  totalOutstanding: number | null;
  overdueAmount: number | null;
  nextDueDate: string | null;
  nextDueAmount: number | null;
  errorCode: string | null;
  completedAt: string | null;
  /** Ngày ghi vào sổ nợ khi khác ngày thu (trả kỳ trước hạn); `null` là ghi ngay. */
  postOn: string | null;
}

export interface EarlySettlementQuote {
  quoteId: string;
  loanApplicationId: number;
  currency: string;
  transactionDate: string;
  principalPortion: number;
  interestPortion: number;
  coreFeePortion: number;
  penaltyPortion: number;
  coreAmount: number;
  platformFee: number;
  investorFeeShare: number;
  finoraFeeShare: number;
  totalAmount: number;
  feeRate: number;
  policyVersion: string;
  status: 'ACTIVE' | 'CONSUMED' | 'EXPIRED';
  expiresAt: string;
}

export interface PartialPrepaymentQuote {
  quoteId: string;
  loanApplicationId: number;
  currency: string;
  transactionDate: string;
  scheduledDue: number;
  prepaidPrincipal: number;
  coreAmount: number;
  platformFee: number;
  investorFeeShare: number;
  finoraFeeShare: number;
  totalAmount: number;
  outstandingPrincipalBefore: number;
  nextDueDateBefore: string | null;
  nextDueAmountBefore: number;
  feeRate: number;
  policyVersion: string;
  allocationStrategy: string;
  status: 'ACTIVE' | 'CONSUMED' | 'EXPIRED';
  expiresAt: string;
}

export type RescheduleType = 'INSTALLMENT_ADJUSTMENT' | 'TERM_EXTENSION';
export type RescheduleStatus =
  | 'PENDING_REVIEW'
  | 'PENDING_INVESTOR_CONSENT'
  | 'INVESTOR_REJECTED'
  | 'REJECTED'
  | 'CREATE_PENDING'
  | 'CREATING'
  | 'APPROVAL_PENDING'
  | 'APPROVING'
  | 'COMPLETED'
  | 'RECONCILIATION_REQUIRED'
  | 'MANUAL_REVIEW';

export interface ReschedulePolicy {
  termsVersion: string;
  termsText: string;
  termsHash: string;
}

export interface RescheduleRequest {
  requestId: string;
  loanNumber: string;
  requestType: RescheduleType;
  rescheduleFromDate: string;
  adjustedDueDate: string | null;
  extraTerms: number | null;
  reasonComment: string;
  termsVersion: string;
  status: RescheduleStatus;
  originalMaturityDate: string;
  newMaturityDate: string | null;
  decisionComment: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRescheduleInput {
  requestType: RescheduleType;
  rescheduleFromDate: string;
  adjustedDueDate?: string;
  extraTerms?: number;
  reasonComment: string;
  confirmedTermsVersion: string;
}

