import { useAsync } from '@/hooks/useAsync';
import { getAutoInvest, getAutoInvestMatches, getInvestmentContract, getPortfolio } from '../api';

export const usePortfolio = () => useAsync(getPortfolio, []);
export const useAutoInvest = () => useAsync(getAutoInvest, []);
export const useAutoInvestMatches = () => useAsync(getAutoInvestMatches, []);
export const useInvestmentContract = () => useAsync(getInvestmentContract, []);
