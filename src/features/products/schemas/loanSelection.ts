import { formatMoneyRange } from '@/utils/format';
import { localTodayIso, normalizeDisbursementDate } from '../mappers/disbursementDate';

/**
 * Số tiền phải nằm trong [minAmount, maxAmount] của Product. Chỉ để báo sớm cho
 * người vay: backend vẫn kiểm tra lại khi tính lịch trả và khi nộp hồ sơ.
 */
export function validateAmount(amount: number, minAmount: number, maxAmount: number): string | null {
  if (amount >= minAmount && amount <= maxAmount) return null;
  return `Số tiền phải nằm trong khoảng ${formatMoneyRange(minAmount, maxAmount)}.`;
}

/**
 * Ngày giải ngân dự kiến phải là một ngày có thật và không trước ngày tại thiết
 * bị. Backend vẫn kiểm tra lại; frontend chỉ báo sớm bằng câu dễ hiểu.
 */
export function validateDisbursementDate(
  date: string,
  today: string = localTodayIso(),
): string | null {
  const normalized = normalizeDisbursementDate(date, today);
  if (normalized && normalized >= today) return null;
  if (!normalized) return 'Nhập ngày đúng định dạng ngày/tháng/năm, ví dụ 01/11/2026.';
  return 'Ngày giải ngân dự kiến phải là hôm nay hoặc một ngày trong tương lai.';
}
