import { mockResponse } from './delay';
import {
  LOAN_PROGRESS,
  LOAN_PROGRESS_STEPS,
  REPAYMENT_ROWS,
  REPAYMENT_SUMMARY,
  SETTLEMENT,
} from './fixtures';
import type {
  LoanProgress,
  RepaymentPeriodRow,
  SettlementQuote,
} from '@/types/contract';

export const getProgress = (): Promise<LoanProgress> => mockResponse('servicing', LOAN_PROGRESS);

export const getProgressSteps = (): Promise<typeof LOAN_PROGRESS_STEPS> =>
  mockResponse('servicing', LOAN_PROGRESS_STEPS);

export const getRepaymentSchedule = (): Promise<{
  summary: typeof REPAYMENT_SUMMARY;
  rows: RepaymentPeriodRow[];
}> => mockResponse('servicing', { summary: REPAYMENT_SUMMARY, rows: REPAYMENT_ROWS });

export const getSettlementQuote = (): Promise<SettlementQuote> =>
  mockResponse('servicing', SETTLEMENT);

export const requestRestructure = (): Promise<{ ok: true }> =>
  mockResponse('servicing', { ok: true });
