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
export type RepaymentStatus =
  | 'COLLECTED'
  | 'CORE_POSTING'
  | 'CORE_POSTED'
  | 'COMPLETED'
  | 'RECONCILIATION_REQUIRED'
  | 'FAILED';

export interface RepaymentResult {
  repaymentId: string;
  loanApplicationId: number;
  repaymentType: RepaymentType;
  quoteId: string | null;
  partialPrepaymentQuoteId: string | null;
  amount: number;
  coreAmount: number;
  platformFee: number;
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

