import { isMocked } from '@/lib/mockFlag';
import * as contractMock from '@/lib/mocks/contract';
import { ApiError, aiFetch, apiFetch, generateIdempotencyKey } from '@/lib/api';
import type {
  CreateLoanApplicationRequest,
  LoanApplication,
  LoanApplicationHistory,
  PageResponse,
} from '@/types/loan';
import type { CreditScoreRequest, CreditScoreResponse } from '@/types/credit';
import type { LoanContract, LoanProgress, RepaymentPeriodRow, SettlementQuote } from '@/types/contract';

const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

/* ---- Đã có backend thật trong `finora-loan` ---- */

export const listMyApplications = async (): Promise<LoanApplication[]> => {
  const page = await apiFetch<PageResponse<LoanApplication>>('/loan-applications/me?page=0&size=50');
  return page.data;
};

export const getApplication = (applicationNumber: string): Promise<LoanApplication> =>
  apiFetch<LoanApplication>(`/loan-applications/${applicationNumber}`);

export const getApplicationHistory = (
  applicationNumber: string,
): Promise<LoanApplicationHistory[]> =>
  apiFetch<LoanApplicationHistory[]>(`/loan-applications/${applicationNumber}/history`);

export const createApplication = (body: CreateLoanApplicationRequest): Promise<LoanApplication> =>
  apiFetch<LoanApplication>('/loan-applications', {
    method: 'POST',
    headers: { 'Idempotency-Key': generateIdempotencyKey() },
    body: JSON.stringify(body),
  });

export const withdrawApplication = (applicationNumber: string): Promise<LoanApplication> =>
  apiFetch<LoanApplication>(`/loan-applications/${applicationNumber}/withdraw`, { method: 'POST' });

/* ---- Chấm điểm tín dụng: gọi thẳng `finora-ai` ---- */

/**
 * `POST /api/v1/ai/credit/score` của `finora-ai`.
 *
 * Gọi trực tiếp AI service chứ không qua `finora-loan`, vì kết quả chấm điểm
 * phía Loan hiện chỉ lộ qua `AdminCreditScoringController` (`/api/v1/admin/...`)
 * — người vay chưa có endpoint xem điểm của chính mình.
 *
 * Đây là bước xem trước trước khi nộp. Sau khi hồ sơ được nộp, `finora-loan`
 * vẫn tự chấm lại bằng worker của nó; con số hiển thị ở đây không thay thế
 * kết quả chính thức.
 */
export const scoreCredit = (body: CreditScoreRequest): Promise<CreditScoreResponse> =>
  aiFetch<CreditScoreResponse>('/credit/score', {
    method: 'POST',
    body: JSON.stringify(body),
  });

/* ---- Chưa có endpoint cho vai trò người vay ---- */

export const getProgress = (): Promise<LoanProgress> =>
  isMocked('servicing') ? contractMock.getProgress() : notImplemented('Tiến trình hồ sơ');

export const getProgressSteps = () =>
  isMocked('servicing') ? contractMock.getProgressSteps() : notImplemented('Các bước hồ sơ');

export const getRepaymentSchedule = (): Promise<{
  summary: { loanId: string; paidPeriods: number; totalPeriods: number; outstandingPrincipal: number };
  rows: RepaymentPeriodRow[];
}> => (isMocked('servicing') ? contractMock.getRepaymentSchedule() : notImplemented('Lịch trả nợ'));

export const getSettlementQuote = (): Promise<SettlementQuote> =>
  isMocked('servicing') ? contractMock.getSettlementQuote() : notImplemented('Báo giá tất toán');

export const requestRestructure = (): Promise<{ ok: true }> =>
  isMocked('servicing') ? contractMock.requestRestructure() : notImplemented('Tái cơ cấu');

export const getLoanContract = (): Promise<LoanContract> =>
  isMocked('signature') ? contractMock.getLoanContract() : notImplemented('Hợp đồng vay');

export const signLoanContract = (): Promise<{ ok: true }> =>
  isMocked('signature') ? contractMock.sign() : notImplemented('Ký hợp đồng vay');
