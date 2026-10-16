import { useAsync } from '@/hooks/useAsync';
import {
  getLoanApplication,
  getScheduledDue,
  getServicingLoan,
  getServicingSchedule,
  listServicingLoans,
} from '../api/servicingApi';
import type { ScheduledDue } from '../types';

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

/** Nghĩa vụ trả ngay theo Fineract; `null` khi chưa biết hồ sơ (chưa tải xong khoản vay). */
export const useScheduledDue = (loanApplicationId: number | null) => useAsync<ScheduledDue | null>(
  signal => (loanApplicationId == null ? Promise.resolve(null) : getScheduledDue(loanApplicationId, signal)),
  [loanApplicationId],
);

