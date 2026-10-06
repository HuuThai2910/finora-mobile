import { apiFetch, paymentFetch } from '@/lib/api';
import type { LoanApplication, PageResponse } from '@/types/loan';
import type {
  CreateRescheduleInput,
  EarlySettlementQuote,
  PartialPrepaymentQuote,
  RepaymentResult,
  ReschedulePolicy,
  RescheduleRequest,
  ServicingLoanSummary,
  ServicingSchedule,
} from '../types';

export const listServicingLoans = (signal?: AbortSignal): Promise<PageResponse<ServicingLoanSummary>> =>
  apiFetch<PageResponse<ServicingLoanSummary>>('/loans/me?page=0&size=50', { signal });

export const getServicingLoan = (loanNumber: string, signal?: AbortSignal): Promise<ServicingLoanSummary> =>
  apiFetch<ServicingLoanSummary>(`/loans/${encodeURIComponent(loanNumber)}`, { signal });

export const getServicingSchedule = (loanNumber: string, signal?: AbortSignal): Promise<ServicingSchedule> =>
  apiFetch<ServicingSchedule>(`/loans/${encodeURIComponent(loanNumber)}/repayment-schedule`, { signal });

export const getLoanApplication = (applicationNumber: string, signal?: AbortSignal): Promise<LoanApplication> =>
  apiFetch<LoanApplication>(`/loan-applications/${encodeURIComponent(applicationNumber)}`, { signal });

export const createScheduledRepayment = (
  loanApplicationId: number,
  amount: number,
  idempotencyKey: string,
): Promise<RepaymentResult> => paymentFetch<RepaymentResult>('/repayments', {
  method: 'POST',
  headers: { 'Idempotency-Key': idempotencyKey },
  body: JSON.stringify({ loanApplicationId, amount }),
  timeoutMs: 30_000,
});

export const getRepayment = (repaymentId: string, signal?: AbortSignal): Promise<RepaymentResult> =>
  paymentFetch<RepaymentResult>(`/repayments/${encodeURIComponent(repaymentId)}`, { signal });

export const createPartialPrepaymentQuote = (
  loanApplicationId: number,
  prepaidPrincipal: number,
): Promise<PartialPrepaymentQuote> => paymentFetch<PartialPrepaymentQuote>(
  '/repayments/partial-prepayment-quotes',
  { method: 'POST', body: JSON.stringify({ loanApplicationId, prepaidPrincipal }), timeoutMs: 30_000 },
);

export const confirmPartialPrepayment = (
  quoteId: string,
  idempotencyKey: string,
): Promise<RepaymentResult> => paymentFetch<RepaymentResult>('/repayments/partial-prepayment', {
  method: 'POST',
  headers: { 'Idempotency-Key': idempotencyKey },
  body: JSON.stringify({ quoteId }),
  timeoutMs: 30_000,
});

export const createEarlySettlementQuote = (loanApplicationId: number): Promise<EarlySettlementQuote> =>
  paymentFetch<EarlySettlementQuote>('/repayments/early-settlement-quotes', {
    method: 'POST', body: JSON.stringify({ loanApplicationId }), timeoutMs: 30_000,
  });

export const confirmEarlySettlement = (
  quoteId: string,
  idempotencyKey: string,
): Promise<RepaymentResult> => paymentFetch<RepaymentResult>('/repayments/early-settlement', {
  method: 'POST',
  headers: { 'Idempotency-Key': idempotencyKey },
  body: JSON.stringify({ quoteId }),
  timeoutMs: 30_000,
});

export const getReschedulePolicy = (signal?: AbortSignal): Promise<ReschedulePolicy> =>
  apiFetch<ReschedulePolicy>('/loans/reschedule-policy', { signal });

export const listRescheduleRequests = (
  loanNumber: string,
  signal?: AbortSignal,
): Promise<PageResponse<RescheduleRequest>> => apiFetch<PageResponse<RescheduleRequest>>(
  `/loans/${encodeURIComponent(loanNumber)}/reschedule-requests?page=0&size=20`, { signal },
);

export const submitRescheduleRequest = (
  loanNumber: string,
  input: CreateRescheduleInput,
  idempotencyKey: string,
): Promise<RescheduleRequest> => apiFetch<RescheduleRequest>(
  `/loans/${encodeURIComponent(loanNumber)}/reschedule-requests`,
  {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(input),
    timeoutMs: 30_000,
  },
);
