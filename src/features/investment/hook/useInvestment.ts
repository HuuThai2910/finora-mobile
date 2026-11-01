import { useAsync } from '@/hooks/useAsync';
import {
  getAutoInvest,
  getAutoInvestMatches,
  getInvestmentContract,
  getInvestmentCommitments,
  getPortfolio,
  getRescheduleConsents,
} from '../api';

export const usePortfolio = () => useAsync(getPortfolio, []);
export const useAutoInvest = () => useAsync(getAutoInvest, []);
export const useAutoInvestMatches = () => useAsync(getAutoInvestMatches, []);
export const useInvestmentContract = () => useAsync(getInvestmentContract, []);
export const useInvestmentCommitments = () => useAsync(getInvestmentCommitments, []);
export const useRescheduleConsents = () => useAsync(getRescheduleConsents, []);
