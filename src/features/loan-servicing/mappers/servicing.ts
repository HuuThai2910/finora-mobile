import type { TagTone } from '@/components/ui';
import type { RepaymentResult, RescheduleStatus, RescheduleType, ServicingLoanStatus } from '../types';

const STATUS_LABELS: Record<ServicingLoanStatus, string> = {
  ACTIVE: 'Đang trả nợ',
  RESTRUCTURING: 'Đang cơ cấu',
  SETTLED: 'Đã tất toán',
  DEFAULTED: 'Nợ xấu',
  WRITTEN_OFF: 'Đã xử lý rủi ro',
};

export const servicingStatusLabel = (status: ServicingLoanStatus): string => STATUS_LABELS[status];

export const servicingStatusTone = (status: ServicingLoanStatus): TagTone => {
  if (status === 'ACTIVE') return 'blue';
  if (status === 'SETTLED') return 'green';
  if (status === 'DEFAULTED' || status === 'WRITTEN_OFF') return 'red';
  return 'amber';
};

export const repaymentStatusLabel = (value: RepaymentResult['status']): string => ({
  COLLECTED: 'Đã thu tiền',
  CORE_POSTING: 'Đang ghi nhận vào khoản vay',
  CORE_POSTED: 'Đã ghi nhận, đang phân phối',
  COMPLETED: 'Hoàn tất',
  RECONCILIATION_REQUIRED: 'Cần đối soát',
  FAILED: 'Không thành công',
})[value];

export const repaymentStatusTone = (value: RepaymentResult['status']): TagTone => {
  if (value === 'COMPLETED') return 'green';
  if (value === 'FAILED') return 'red';
  if (value === 'RECONCILIATION_REQUIRED') return 'amber';
  return 'blue';
};

const RESCHEDULE_STATUS_LABELS: Record<RescheduleStatus, string> = {
  PENDING_REVIEW: 'Chờ thẩm định',
  REJECTED: 'Đã từ chối',
  CREATE_PENDING: 'Đã duyệt, chờ tạo',
  CREATING: 'Đang tạo trên core',
  APPROVAL_PENDING: 'Chờ core phê duyệt',
  APPROVING: 'Đang phê duyệt trên core',
  COMPLETED: 'Đã áp dụng',
  RECONCILIATION_REQUIRED: 'Cần đối soát',
  MANUAL_REVIEW: 'Cần kiểm tra thủ công',
};

export const rescheduleStatusLabel = (value: RescheduleStatus): string =>
  RESCHEDULE_STATUS_LABELS[value];

export const rescheduleStatusTone = (value: RescheduleStatus): TagTone => {
  if (value === 'COMPLETED') return 'green';
  if (value === 'REJECTED') return 'red';
  if (value === 'RECONCILIATION_REQUIRED' || value === 'MANUAL_REVIEW') return 'amber';
  return 'blue';
};

export const rescheduleTypeLabel = (value: RescheduleType): string =>
  value === 'TERM_EXTENSION' ? 'Gia hạn khoản vay' : 'Điều chỉnh kỳ hạn';

/** Ngày LocalDate cho backend, không qua UTC để tránh lệch ngày trên thiết bị ở múi giờ âm. */
export const localDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isLocalDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
};

export const addMonths = (value: string, months: number): string => {
  const [year, month, day] = value.split('-').map(Number);
  const firstOfTargetMonth = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(
    firstOfTargetMonth.getFullYear(),
    firstOfTargetMonth.getMonth() + 1,
    0,
  ).getDate();
  const date = new Date(
    firstOfTargetMonth.getFullYear(),
    firstOfTargetMonth.getMonth(),
    Math.min(day, lastDay),
  );
  return localDate(date);
};

export const parseDong = (value: string): number | null => {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const amount = Number(digits);
  return Number.isSafeInteger(amount) ? amount : null;
};
