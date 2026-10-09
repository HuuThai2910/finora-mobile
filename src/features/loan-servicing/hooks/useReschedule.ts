import { useAsync } from '@/hooks/useAsync';
import { getReschedulePolicy, getServicingSchedule, listRescheduleRequests } from '../api/servicingApi';

/**
 * Dữ liệu của màn cơ cấu khoản vay, tải song song trong một lần:
 * - điều khoản cơ cấu hiện hành (phiên bản phải gửi kèm khi xác nhận);
 * - các đề nghị đã gửi của khoản vay (mới nhất trước) để biết còn đề nghị nào đang xử lý;
 * - số liệu khoản vay kèm lịch trả, dùng để gợi ý ngày đến hạn cho "Áp dụng từ kỳ".
 *
 * Hủy request khi rời màn hoặc đổi khoản vay (qua `useAsync`).
 */
export const useReschedule = (loanNumber: string) =>
  useAsync(async signal => {
    const [policy, history, schedule] = await Promise.all([
      getReschedulePolicy(signal),
      listRescheduleRequests(loanNumber, signal),
      getServicingSchedule(loanNumber, signal),
    ]);
    return { policy, history: history.data, loan: schedule.loan, periods: schedule.periods };
  }, [loanNumber]);
