import type {
  BorrowerKycStatus,
  BorrowerProfile,
  LoanDecisionSource,
} from '@/types/invest';

/**
 * Contract `InvestorBorrowerProfileResponse` của Loan Service
 * (`GET /investor/loan-applications/{applicationNumber}/borrower-profile`).
 *
 * Khác Investment, Loan trả tiền và tỷ lệ dạng số JSON; `dtiSnapshot` đã là phần trăm, còn
 * `pdProbability` là tỷ lệ 0..1. Response cố ý không có họ tên, CCCD, liên hệ và SHAP.
 */
export interface BorrowerProfileDto {
  applicationNumber: string;
  loan: {
    purposeCode: string;
    purposeLabel: string;
    purposeDetail: string | null;
    requestedAmount: number;
    requestedTermMonths: number;
    repaymentMethod: string;
    finalAnnualInterestRate: number | null;
    firstInstallment: number | null;
    maximumInstallment: number | null;
    totalRepayment: number | null;
    expectedDisbursementDate: string | null;
  };
  capacity: {
    declaredMonthlyIncome: number;
    monthlyDebtObligations: number;
    dtiSnapshot: number;
    employmentLengthMonths: number | null;
    informationSource: string;
    capturedAt: string | null;
  };
  background: {
    age: number | null;
    kycStatus: string | null;
    profileSource: string | null;
    checkedAt: string | null;
    homeOwnership: string | null;
    educationLevel: string | null;
  };
  assessment: {
    evaluationScore: number | null;
    creditGrade: string | null;
    pdProbability: number | null;
    riskScore: number | null;
    decisionSource: string | null;
    scoredAt: string | null;
  } | null;
}

const KYC_STATUSES: readonly BorrowerKycStatus[] = ['VERIFIED', 'PENDING', 'PROCESSING', 'REJECTED', 'EXPIRED'];
const DECISION_SOURCES: readonly LoanDecisionSource[] = ['AI_POLICY', 'ADMIN'];

/** Giá trị enum lạ không làm vỡ màn hình; thiếu hẳn thì giữ `null` để màn hình ghi "chưa có". */
function toEnum<T extends string>(allowed: readonly T[], value: string | null | undefined): T | 'UNKNOWN' | null {
  if (value == null) return null;
  return allowed.find(item => item === value) ?? 'UNKNOWN';
}

export function toBorrowerProfile(dto: BorrowerProfileDto): BorrowerProfile {
  const { loan, capacity, background, assessment } = dto;
  const purposeDetail = loan.purposeDetail?.trim();
  return {
    applicationNumber: dto.applicationNumber,
    loan: {
      purposeLabel: loan.purposeLabel,
      purposeDetail: purposeDetail ? purposeDetail : null,
      requestedAmount: loan.requestedAmount,
      termMonths: loan.requestedTermMonths,
      repaymentMethod: loan.repaymentMethod,
      finalAnnualRate: loan.finalAnnualInterestRate,
      firstInstallment: loan.firstInstallment,
      maximumInstallment: loan.maximumInstallment,
      totalRepayment: loan.totalRepayment,
      expectedDisbursementDate: loan.expectedDisbursementDate,
    },
    capacity: {
      monthlyIncome: capacity.declaredMonthlyIncome,
      monthlyDebt: capacity.monthlyDebtObligations,
      dtiPercent: capacity.dtiSnapshot,
      employmentMonths: capacity.employmentLengthMonths,
      selfDeclared: capacity.informationSource === 'SELF_DECLARED',
      capturedAt: capacity.capturedAt,
    },
    background: {
      age: background.age,
      kycStatus: toEnum(KYC_STATUSES, background.kycStatus),
      mockProfile: background.profileSource === 'MOCK_USER_PROFILE',
      homeOwnership: background.homeOwnership,
      educationLevel: background.educationLevel,
    },
    assessment: assessment
      ? {
          evaluationScore: assessment.evaluationScore,
          grade: assessment.creditGrade,
          // Chỉ đổi đơn vị để hiển thị: 0,3568 → 35,68 (%).
          pdPercent: assessment.pdProbability == null ? null : assessment.pdProbability * 100,
          ruleScore: assessment.riskScore,
          decisionSource: toEnum(DECISION_SOURCES, assessment.decisionSource),
          scoredAt: assessment.scoredAt,
        }
      : null,
  };
}
