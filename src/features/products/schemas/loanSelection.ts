import { formatMoneyRange } from '@/utils/format';

/** Dạng ngày bước 2 gửi thẳng cho backend trong `expectedDisbursementDate`. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Số tiền phải nằm trong [minAmount, maxAmount] của Product. Chỉ để báo sớm cho
 * người vay: backend vẫn kiểm tra lại khi tính lịch trả và khi nộp hồ sơ.
 */
export function validateAmount(amount: number, minAmount: number, maxAmount: number): string | null {
  if (amount >= minAmount && amount <= maxAmount) return null;
  return `Số tiền phải nằm trong khoảng ${formatMoneyRange(minAmount, maxAmount)}.`;
}

/**
 * Ngày giải ngân dự kiến phải đúng dạng YYYY-MM-DD và không trước hôm nay.
 *
 * Giữ nguyên quy tắc của màn cũ: chỉ kiểm tra dạng chuỗi (không kiểm tra ngày có
 * thật trên lịch) và "hôm nay" là ngày UTC, so theo thứ tự chuỗi ISO. Backend
 * kiểm tra lại khi tính lịch trả.
 */
export function validateDisbursementDate(
  date: string,
  today: string = new Date().toISOString().slice(0, 10),
): string | null {
  if (ISO_DATE.test(date) && date >= today) return null;
  return 'Ngày giải ngân dự kiến phải là hôm nay hoặc một ngày trong tương lai.';
}
