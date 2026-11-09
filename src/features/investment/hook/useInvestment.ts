import { useAsync } from '@/hooks/useAsync';
import {
  getInvestmentContract,
  getInvestmentContracts,
  getInvestmentCommitments,
  getPortfolio,
  getRescheduleConsents,
} from '../api';

export const usePortfolio = () => useAsync(getPortfolio, []);
export const useInvestmentContracts = () => useAsync(getInvestmentContracts, []);
export const useInvestmentContract = (contractNumber?: string) => useAsync(
  signal => getInvestmentContract(contractNumber, signal),
  [contractNumber],
);
export const useInvestmentCommitments = () => useAsync(getInvestmentCommitments, []);
export const useRescheduleConsents = () => useAsync(getRescheduleConsents, []);
