import { useAsync } from '@/hooks/useAsync';
import { getLoanApplication, getServicingLoan, getServicingSchedule, listServicingLoans } from '../api/servicingApi';

export const useServicingLoans = () => useAsync(listServicingLoans, []);

/** Đọc cùng một snapshot UI gồm summary, lịch core và ID hồ sơ dùng cho Payment. */
export const useServicingLoan = (loanNumber: string) => useAsync(async signal => {
  const loan = await getServicingLoan(loanNumber, signal);
  const [schedule, application] = await Promise.all([
    getServicingSchedule(loanNumber, signal),
    getLoanApplication(loan.applicationNumber, signal),
  ]);
  return { loan, schedule, applicationId: application.id };
}, [loanNumber]);

