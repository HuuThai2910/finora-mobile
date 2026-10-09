import { useAsync } from '@/hooks/useAsync';
import { getBorrowerProfile, getMarketLoan, listMarketLoans } from '../api';

export const useMarketLoans = () => useAsync(listMarketLoans, []);

export const useMarketLoan = (loanId: string) =>
  useAsync(() => getMarketLoan(loanId), [loanId]);

/** Hồ sơ người vay của một khoản vay trên sàn, tải theo mã hồ sơ vay của Loan. */
export const useBorrowerProfile = (applicationNumber: string) =>
  useAsync(() => getBorrowerProfile(applicationNumber), [applicationNumber]);
