import { useAsync } from '@/hooks/useAsync';
import { getMarketLoan, listMarketLoans } from '../api';

export const useMarketLoans = () => useAsync(listMarketLoans, []);

export const useMarketLoan = (loanId: string) =>
  useAsync(() => getMarketLoan(loanId), [loanId]);
