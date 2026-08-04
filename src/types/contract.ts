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
