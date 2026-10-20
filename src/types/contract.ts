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

export type LoanContractStatus =
  | 'PENDING_LENDER_SIGNATURES'
  | 'PENDING_BORROWER_SIGNATURE'
  | 'PENDING_SIGNATURE'
  | 'SIGNING'
  | 'SIGNED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'EFFECTIVE'
  | 'COMPLETED';

export interface LoanContractPdfDocument {
  /**
   * `SIGNABLE` trong lúc các bên còn ký. Sau khi đủ chữ ký: `SIGNED_PDF` (bản PAdES có chữ ký mọi bên, R5) với hợp
   * đồng ký PAdES, `SIGNED_RECEIPT` (bản xác nhận cũ) với hợp đồng lập trước R5.
   */
  artifactType: 'SIGNABLE' | 'SIGNED_PDF' | 'SIGNED_RECEIPT';
  documentVersion: string;
  contentType: 'application/pdf';
  contentHash: string;
  contentLength: number;
  downloadPath: string;
}

/** Cách ký chốt khi lập hợp đồng: bằng chứng tách rời (trước R5) hoặc chữ ký PAdES-B-B nhúng vào chính tệp PDF. */
export type ContractSignatureProfile = 'DETACHED_EVIDENCE' | 'PADES_B_B';

/**
 * Bản mới nhất của chuỗi chữ ký PAdES (`/signed-document`): `signatureCount` là số chữ ký đã nhúng trong tệp. Khi đủ
 * chữ ký các bên, đây cũng là bản `/document` trả về.
 */
export interface LoanContractSignedPdfDocument {
  signatureFormat: string;
  signatureCount: number;
  contentHash: string;
  contentLength: number;
  lastSignedAt: string;
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
  disbursementStatus:
    | 'WAITING_PAYMENT'
    | 'CORE_BOOKING_PENDING'
    | 'CORE_BOOKING'
    | 'RETRY_PENDING'
    | 'REPAIR_REQUIRED'
    | 'COMPLETED'
    | 'PAYMENT_FAILED'
    | null;
  paymentReference: string | null;
  fineractLoanId: number | null;
  disbursedAt: string | null;
  updatedAt: string;
  /** Các field R5 (W3C) là bổ sung; backend cũ không trả thì coi như hợp đồng ký kiểu bằng chứng tách rời. */
  signatureProfile?: ContractSignatureProfile | null;
  /** Null khi chưa bên nào ký số hoặc hợp đồng dùng bằng chứng tách rời. */
  signedPdfDocument?: LoanContractSignedPdfDocument | null;
  /** Trang biên nhận chữ ký (`/receipt`, PAdES) hoặc bản xác nhận cũ; null khi chưa đủ chữ ký. */
  receiptDocument?: LoanContractPdfDocument | null;
}

export interface LoanContractHistory {
  id: number;
  fromStatus: LoanContractStatus | null;
  toStatus: LoanContractStatus;
  reasonCode: string | null;
  actorType: 'BORROWER' | 'INVESTOR' | 'ADMIN' | 'SYSTEM';
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
