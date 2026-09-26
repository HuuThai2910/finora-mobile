import { useMyApplications } from '@/features/applications';
import { SCHEDULE_CONTRACT_STATUSES } from '../constant';

/** Nơi lối tắt "Lịch trả nợ" dẫn tới. */
export type ScheduleTarget =
  | { kind: 'contract'; contractNumber: string }
  | { kind: 'contracts' };

/**
 * Chọn đích cho lối tắt "Lịch trả nợ" ở màn Hồ sơ.
 *
 * Màn lịch trả nợ cần biết của hợp đồng nào. Khi người dùng có đúng một hợp
 * đồng đã ký/đang hiệu lực thì mở thẳng lịch của hợp đồng đó; không có hoặc có
 * nhiều hơn một thì mở danh sách hợp đồng để người dùng tự chọn, thay vì đoán.
 *
 * Dùng lại `useMyApplications` (cùng tham số với trang chủ) nên thường đọc từ
 * cache RTK Query chứ không gọi thêm API. Lúc đang tải hoặc lỗi thì rơi về danh
 * sách hợp đồng — vẫn là một đích có thật, nên thẻ không cần trạng thái riêng.
 */
export function useScheduleShortcut(): ScheduleTarget {
  const { contractsByApplication } = useMyApplications();
  const payable = Array.from(contractsByApplication.values()).filter(contract =>
    SCHEDULE_CONTRACT_STATUSES.includes(contract.status),
  );
  const [only, ...others] = payable;

  return only && others.length === 0
    ? { kind: 'contract', contractNumber: only.contractNumber }
    : { kind: 'contracts' };
}
