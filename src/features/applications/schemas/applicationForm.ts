import type { CreateLoanApplicationRequest } from '@/types/loan';

export type ApplicationFormValues = {
  purposeCode: string | null;
  purposeDetail: string;
  monthlyIncome: string;
  monthlyDebt: string;
  employmentMonths: string;
  educationLevel: string | null;
  homeOwnership: string | null;
  accepted: boolean;
};

export type LoanSelection = {
  productId: number;
  amount: number;
  termMonths: number;
  expectedDisbursementDate: string;
  pricingDisclosureVersion: string;
};

export type ApplicationFormErrors = Partial<Record<
  'purpose' | 'purposeDetail' | 'income' | 'debt' | 'employment' | 'home' | 'accepted',
  string
>>;

const digits = (value: string): number => Number(value.replace(/\D/g, ''));

/** Gom validation và mapping DTO ra khỏi screen để không vô tình nhập lại amount/term ở bước hồ sơ. */
export function buildApplicationRequest(
  selection: LoanSelection,
  values: ApplicationFormValues,
  purposeRequiresDetail: boolean,
): { request: CreateLoanApplicationRequest | null; errors: ApplicationFormErrors } {
  const errors: ApplicationFormErrors = {};
  const income = digits(values.monthlyIncome);
  const debt = digits(values.monthlyDebt);
  const employment = values.employmentMonths.trim() ? digits(values.employmentMonths) : undefined;

  if (!values.purposeCode) errors.purpose = 'Chọn mục đích vay.';
  if (purposeRequiresDetail && !values.purposeDetail.trim()) {
    errors.purposeDetail = 'Mục đích này cần mô tả phương án sử dụng vốn.';
  }
  if (values.purposeDetail.length > 500) errors.purposeDetail = 'Tối đa 500 ký tự.';
  if (!income) errors.income = 'Nhập thu nhập hàng tháng.';
  if (debt < 0) errors.debt = 'Nghĩa vụ nợ không được là số âm.';
  if (employment !== undefined && employment <= 0) errors.employment = 'Thâm niên phải lớn hơn 0 tháng.';
  if (!values.homeOwnership) errors.home = 'Chọn tình trạng nhà ở.';
  if (!values.accepted) errors.accepted = 'Cần xác nhận đã xem điều khoản và lịch trả dự kiến.';

  if (Object.keys(errors).length > 0 || !values.purposeCode || !values.homeOwnership) {
    return { request: null, errors };
  }

  return {
    errors,
    request: {
      loanProductId: selection.productId,
      requestedAmount: selection.amount,
      requestedTermMonths: selection.termMonths,
      purposeCode: values.purposeCode,
      purposeDetail: values.purposeDetail.trim() || undefined,
      declaredMonthlyIncome: income,
      employmentLengthMonths: employment,
      educationLevel: values.educationLevel ?? undefined,
      homeOwnership: values.homeOwnership,
      monthlyDebtObligations: debt,
      expectedDisbursementDate: selection.expectedDisbursementDate,
      pricingDisclosureVersion: selection.pricingDisclosureVersion,
      pricingDisclosureAccepted: true,
    },
  };
}
