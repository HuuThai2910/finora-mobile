import { useAsync } from '@/hooks/useAsync';
import {
  getLoanContract,
  getProgress,
  getProgressSteps,
  getRepaymentSchedule,
  getSettlementQuote,
  listMyApplications,
  scoreCredit,
} from '../api';
import type { CreditScoreRequest } from '@/types/credit';

export const useMyApplications = () => useAsync(listMyApplications, []);

/** Chấm điểm cho một hồ sơ nháp — gọi `finora-ai` mỗi khi hồ sơ đổi. */
export const useCreditScore = (body: CreditScoreRequest) =>
  useAsync(() => scoreCredit(body), [JSON.stringify(body)]);
export const useLoanProgress = () => useAsync(getProgress, []);
export const useProgressSteps = () => useAsync(getProgressSteps, []);
export const useRepaymentSchedule = () => useAsync(getRepaymentSchedule, []);
export const useSettlementQuote = () => useAsync(getSettlementQuote, []);
export const useLoanContract = () => useAsync(getLoanContract, []);
