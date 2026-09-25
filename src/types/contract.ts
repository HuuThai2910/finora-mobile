export type SignerStatus = 'SIGNED' | 'PENDING';

export interface ContractSigner {
  role: string;
  status: SignerStatus;
}

export interface LoanContract {
  id: string;
  amount: number;
  termMonths: number;
  annualRate: number;
  investorCount: number;
  signers: ContractSigner[];
  /** Băm nội dung hợp đồng, hiển thị rút gọn như mockup. */
  documentHash: string;
}

export type LoanContractStatus = 'PENDING_SIGNATURE' | 'SIGNING' | 'SIGNED' | 'DECLINED' | 'EXPIRED' | 'EFFECTIVE' | 'COMPLETED';

export interface LoanContractPdfDocument {
  artifactType: 'SIGNABLE' | 'SIGNED_RECEIPT';
  documentVersion: string;
  contentType: 'application/pdf';
  contentHash: string;
  contentLength: number;
  downloadPath: string;
}

export interface LoanContractSummary {
  contractNumber: string;
  applicationNumber: string;
  principalAmount: number;
  termMonths: number;
  annualInterestRate: number;
  totalRepayment: number;
  status: LoanContractStatus;
  expiresAt: string;
  version: number;
  createdAt: string;
}

export interface LoanContractDetail extends LoanContractSummary {
  repaymentMethod: 'ANNUITY' | 'EQUAL_PRINCIPAL';
  totalInterest: number;
  totalFees: number;
  totalPenalties: number;
  firstInstallment: number;
  maximumInstallment: number;
  expectedDisbursementDate: string;
  scheduleResponseHash: string;
  schedulePeriods: SchedulePeriod[];
  termsVersion: string;
  documentVersion: string;
  documentContent: string;
  documentContentType: string;
  documentHash: string;
  pdfDocument: LoanContractPdfDocument | null;
  signedBy: string | null;
  signedAt: string | null;
  signatureMethod: 'CLICK_WRAP_MVP' | 'VNPT_SMART_CA' | null;
  signatureProvider: 'MOCK' | 'VNPT_SMART_CA' | null;
  signatureTransactionId: string | null;
  signatureEvidenceHash: string | null;
  signatureDocumentId: string | null;
  signatureRequestedAt: string | null;
  availableSignatureProvider: 'MOCK' | 'VNPT_SMART_CA';
  availableSignatureMethod: 'CLICK_WRAP_MVP' | 'VNPT_SMART_CA';
  declinedBy: string | null;
  declinedAt: string | null;
  declineReasonCode: string | null;
  declineReasonDetail: string | null;
  effectiveAt: string | null;
  updatedAt: string;
}

export interface LoanContractHistory {
  id: number;
  fromStatus: LoanContractStatus | null;
  toStatus: LoanContractStatus;
  reasonCode: string | null;
  actorType: 'BORROWER' | 'ADMIN' | 'SYSTEM';
  actorId: string;
  occurredAt: string;
}

export interface LoanContractActionResponse {
  contractNumber: string;
  status: LoanContractStatus;
  version: number;
  documentHash: string;
  signatureProvider: 'MOCK' | 'VNPT_SMART_CA' | null;
  signatureMethod: 'CLICK_WRAP_MVP' | 'VNPT_SMART_CA' | null;
  signatureTransactionId: string | null;
  signatureEvidenceHash: string | null;
  actorId: string | null;
  actedAt: string | null;
}

export interface RepaymentPeriodRow {
  period: number;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'DUE_SOON' | 'UPCOMING' | 'OVERDUE';
}

export interface LoanProgress {
  applicationId: string;
  amount: number;
  termMonths: number;
  annualRate: number;
  grade: 'A' | 'B' | 'C' | 'D';
  score: number;
  raisedAmount: number;
  fundedPercent: number;
  investorCount: number;
  daysLeft: number;
}

export interface SettlementQuote {
  loanId: string;
  outstandingPrincipal: number;
  interestToDate: number;
  earlyRepaymentFee: number;
  total: number;
  interestSaved: number;
}
import type { SchedulePeriod } from './loan';
