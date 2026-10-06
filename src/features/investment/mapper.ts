import type {
  AutoInvestConfig,
  AutoInvestMatch,
  InvestmentContract,
  PortfolioPosition,
  PortfolioSummary,
} from '@/types/invest';

/**
 * Chuyển danh mục đầu tư từ contract của Investment Service sang model màn hình.
 */

export interface PortfolioPositionDto {
  loanId: number;
  listingId: number;
  purpose: string | null;
  creditGrade: string | null;
  annualInterestRate: string;
  termMonths: number;
  noteCount: number;
  principalAmount: string;
  outstandingPrincipal: string;
  principalRepaid: string;
  interestReceived: string;
  sharePercent: number;
  status: string;
  daysPastDue: number;
  debtGroup: number;
  overdueAmount: string;
  servicingStatus: string;
  maturityDate: string | null;
  riskDataAsOf: string | null;
}

export interface PortfolioDto {
  pendingAmount: string;
  investedAmount: string;
  principalRepaid: string;
  interestReceived: string;
  totalReceived: string;
  activeNoteCount: number;
  positionCount: number;
  weightedAverageRate: number;
  positions: PortfolioPositionDto[];
}

/** Contract Loan trả cho đúng investor đang đăng nhập; không chứa PII của các bên khác. */
export interface InvestorContractDto {
  contractNumber: string;
  contractStatus: string;
  partyStatus: 'PENDING_SIGNATURE' | 'SIGNING' | 'SIGNED' | 'DECLINED' | 'EXPIRED';
  contractVersion: number;
  documentHash: string;
  pdfDocumentHash: string;
  investorAmount: number;
  termMonths: number;
  allocationCount: number;
  remainingLenderSignatures: number;
  availableSignatureProvider: 'MOCK' | 'VNPT_SMART_CA';
  availableSignatureMethod: 'CLICK_WRAP_MVP' | 'VNPT_SMART_CA';
  expiresAt: string;
}

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function toPosition(dto: PortfolioPositionDto): PortfolioPosition {
  return {
    loanId: dto.loanId,
    listingId: dto.listingId,
    purpose: dto.purpose,
    grade: dto.creditGrade?.trim().toUpperCase() || null,
    // Cùng contract liên service với Market: 15.0000 nghĩa là 15%/năm.
    annualRate: Number(toNumber(dto.annualInterestRate).toFixed(2)),
    termMonths: dto.termMonths,
    noteCount: dto.noteCount,
    principal: toNumber(dto.principalAmount),
    outstanding: toNumber(dto.outstandingPrincipal),
    principalRepaid: toNumber(dto.principalRepaid),
    interestReceived: toNumber(dto.interestReceived),
    sharePercent: Number(dto.sharePercent.toFixed(2)),
    daysPastDue: dto.daysPastDue ?? 0,
    debtGroup: dto.debtGroup ?? 1,
    overdueAmount: toNumber(dto.overdueAmount),
    servicingStatus: dto.servicingStatus ?? 'ACTIVE',
    maturityDate: dto.maturityDate,
    riskDataAsOf: dto.riskDataAsOf,
  };
}

export function toPortfolioSummary(dto: PortfolioDto): PortfolioSummary {
  return {
    investedAmount: toNumber(dto.investedAmount),
    pendingAmount: toNumber(dto.pendingAmount),
    principalRepaid: toNumber(dto.principalRepaid),
    interestReceived: toNumber(dto.interestReceived),
    totalReceived: toNumber(dto.totalReceived),
    activeNoteCount: dto.activeNoteCount,
    positionCount: dto.positionCount,
    // Lãi suất bình quân theo trọng số dư nợ do backend tính. Trước đây màn hình gọi nhầm là IRR —
    // IRR cần cả dòng tiền theo thời gian, backend chưa tính.
    averageRate: Number(dto.weightedAverageRate.toFixed(2)),
    positions: dto.positions.map(toPosition),
  };
}

export function toInvestmentContract(dto: InvestorContractDto): InvestmentContract {
  return {
    reference: dto.contractNumber,
    purpose: 'Hợp đồng cho vay nhiều bên',
    amount: Number(dto.investorAmount),
    noteCount: dto.allocationCount,
    termMonths: dto.termMonths,
    status: dto.partyStatus === 'SIGNED'
      ? 'SIGNED'
      : dto.partyStatus === 'SIGNING' ? 'SIGNING' : 'PENDING_SIGNATURE',
    contractStatus: dto.contractStatus,
    version: dto.contractVersion,
    documentHash: dto.documentHash,
    pdfDocumentHash: dto.pdfDocumentHash,
    remainingLenderSignatures: dto.remainingLenderSignatures,
    availableSignatureProvider: dto.availableSignatureProvider,
    availableSignatureMethod: dto.availableSignatureMethod,
    downloadPath: `/investor/loan-contracts/${dto.contractNumber}/document`,
    expiresAt: dto.expiresAt,
  };
}

/** Tiền và lãi suất đi dạng chuỗi để không mất chính xác khi parse JSON. */
export interface AutoInvestConfigDto {
  enabled: boolean;
  grades: string[];
  minAnnualRate: string;
  maxTermMonths: number;
  amountPerLoan: string;
  enabledAt: string | null;
}

export interface AutoInvestMatchDto {
  at: string;
  listingId: number;
  applicationNumber: string | null;
  creditGrade: string | null;
  annualInterestRate: string | null;
  outcome: 'MATCHED' | 'SKIPPED';
  reason: string | null;
  amount: string | null;
  orderReference: string | null;
}

export const toAutoInvestConfig = (dto: AutoInvestConfigDto): AutoInvestConfig => ({
  enabled: dto.enabled,
  grades: dto.grades,
  minAnnualRate: Number(dto.minAnnualRate),
  maxTermMonths: dto.maxTermMonths,
  amountPerLoan: Number(dto.amountPerLoan),
});

export const toAutoInvestMatch = (dto: AutoInvestMatchDto): AutoInvestMatch => ({
  at: dto.at,
  loanId: dto.applicationNumber ?? `#${dto.listingId}`,
  grade: dto.creditGrade,
  annualRate: dto.annualInterestRate == null ? null : Number(dto.annualInterestRate),
  matched: dto.outcome === 'MATCHED',
  amount: dto.amount == null ? undefined : Number(dto.amount),
  reason: dto.reason ?? undefined,
});
