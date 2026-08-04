export interface PageResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
}

export interface LoanProductCatalog {
  id: number;
  code: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTermMonths: number;
  maxTermMonths: number;
  annualInterestRate: number;
  interestRateUnit: string;
  repaymentMethod: 'ANNUITY' | 'EQUAL_PRINCIPAL';
  rateNotice: string;
}

export interface LoanPurpose {
  code: string;
  label: string;
  aiValue: string;
  requiresDetail: boolean;
}

export interface RepaymentPreviewRequest {
  amount: number;
  termMonths: number;
  expectedDisbursementDate: string;
}

export interface SchedulePeriod {
  period: number;
  fromDate: string;
  dueDate: string;
  daysInPeriod: number;
  principal: number;
  interest: number;
  fees: number;
  penalties: number;
  totalDue: number;
  outstandingBalance: number;
}

export interface RepaymentPreview {
  productId: number;
  amount: number;
  termMonths: number;
  annualInterestRate: number;
  interestRateUnit: string;
  repaymentMethod: string;
  estimatedDisbursementDate: string;
  firstInstallment: number;
  maximumInstallment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalFees: number;
  totalPenalties: number;
  totalRepayment: number;
  periods: SchedulePeriod[];
  calculationPolicyVersion: string;
}

export type LoanApplicationStatus =
  | 'SUBMITTED'
  | 'ELIGIBILITY_PENDING'
  | 'SCORING'
  | 'SCORING_RETRY_PENDING'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicantFinancial {
  declaredMonthlyIncome: number;
  annualIncomeSnapshot: number;
  employmentLengthMonths: number;
  educationLevel: string;
  homeOwnership: string;
  monthlyDebtObligations: number;
  dtiSnapshot: number;
  informationSource: string;
  capturedAt: string;
}

export interface ProductSnapshot {
  code: string;
  name: string;
  configurationVersion: number;
  minAmount: number;
  maxAmount: number;
  minTermMonths: number;
  maxTermMonths: number;
  annualInterestRate: number;
  repaymentMethod: string;
  fineractProductId: number;
  coreMappingId: number;
  coreConfigVersion: string;
}

export interface CalculationSnapshot {
  id: number;
  expectedDisbursementDate: string;
  totalPrincipal: number;
  totalInterest: number;
  totalFees: number;
  totalPenalties: number;
  totalRepayment: number;
  firstInstallment: number;
  maximumInstallment: number;
  calculationPolicyVersion: string;
  calculatedAt: string;
}

export interface LoanApplication {
  id: number;
  applicationNumber: string;
  borrowerId: string;
  loanProductId: number;
  requestedAmount: number;
  requestedTermMonths: number;
  purposeCode: string;
  purposeDetail: string;
  financialInformation: ApplicantFinancial;
  productSnapshot: ProductSnapshot;
  calculationSnapshot: CalculationSnapshot;
  expectedDisbursementDate: string;
  pricingDisclosureVersion: string;
  pricingDisclosureAcceptedAt: string;
  status: LoanApplicationStatus;
  submittedAt: string;
  withdrawnAt: string | null;
  withdrawalReason: string | null;
  latestCreditAssessmentId: number | null;
  version: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanApplicationHistory {
  id: number;
  fromStatus: LoanApplicationStatus;
  toStatus: LoanApplicationStatus;
  reasonCode: string;
  reasonDetail: string;
  actorType: 'BORROWER' | 'ADMIN' | 'SYSTEM';
  actorId: string;
  createdAt: string;
}

export interface CreateLoanApplicationRequest {
  loanProductId: number;
  requestedAmount: number;
  requestedTermMonths: number;
  purposeCode: string;
  purposeDetail?: string;
  declaredMonthlyIncome: number;
  employmentLengthMonths?: number;
  educationLevel?: string;
  homeOwnership: string;
  monthlyDebtObligations: number;
  expectedDisbursementDate: string;
  pricingDisclosureVersion: string;
  pricingDisclosureAccepted: boolean;
}
