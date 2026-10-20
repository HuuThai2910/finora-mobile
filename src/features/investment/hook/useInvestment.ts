import { useAsync } from '@/hooks/useAsync';
import {
  getAutoInvest,
  getAutoInvestMatches,
  getInvestmentContract,
  getPortfolio,
  getRescheduleConsents,
} from '../api';

export const usePortfolio = () => useAsync(getPortfolio, []);
export const useAutoInvest = () => useAsync(getAutoInvest, []);
export const useAutoInvestMatches = () => useAsync(getAutoInvestMatches, []);
export const useInvestmentContract = () => useAsync(getInvestmentContract, []);
export const useRescheduleConsents = () => useAsync(getRescheduleConsents, []);
