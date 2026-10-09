import type { TagTone } from '@/components/ui';
import type { IconName } from '@/constants/icons';
import type { SchedulePeriod } from '@/types/loan';
import { formatDong, formatLocalDate, formatMoneyShort } from '@/utils/format';
import type {
  RepaymentResult,
  RescheduleRequest,
  RescheduleStatus,
  ServicingLoanStatus,
  ServicingLoanSummary,
} from '../types';

/** Nhãn, tông màu và biểu tượng của một trạng thái; luôn có chữ để màu không là tín hiệu duy nhất. */
export type StatusLook = { label: string; tone: TagTone; icon: IconName };

const LOAN_STATUS: Record<ServicingLoanStatus, StatusLook> = {
  ACTIVE: { label: 'Đang trả nợ', tone: 'blue', icon: 'calendarClock' },
  RESTRUCTURING: { label: 'Đang cơ cấu', tone: 'amber', icon: 'refreshCw' },
  SETTLED: { label: 'Đã tất toán', tone: 'green', icon: 'circleCheck' },
  DEFAULTED: { label: 'Nợ xấu', tone: 'red', icon: 'alert' },
  WRITTEN_OFF: { label: 'Đã xử lý rủi ro', tone: 'red', icon: 'circleX' },
};

/** Trạng thái backend mới bổ sung mà app chưa có nhãn thì hiện nguyên mã, tông xám, không vỡ màn. */
export const loanStatusLook = (status: ServicingLoanStatus): StatusLook =>
  LOAN_STATUS[status] ?? { label: status, tone: 'gray', icon: 'info' };

/** Thứ tự chip lọc cố định để chip không nhảy chỗ sau mỗi lần tải lại: khoản còn phải trả trước. */
const LOAN_FILTER_ORDER: readonly ServicingLoanStatus[] = [
  'ACTIVE',
  'RESTRUCTURING',
  'DEFAULTED',
  'SETTLED',
  'WRITTEN_OFF',
];

/** Thanh toán kỳ/khắc phục quá hạn chỉ mở cho hai trạng thái này (giữ đúng điều kiện của màn cũ). */
export const canPayLoan = (loan: ServicingLoanSummary): boolean =>
  (loan.status === 'ACTIVE' || loan.status === 'DEFAULTED') && loan.totalOutstanding > 0;

/** Trả trước một phần và tất toán chỉ dành cho khoản đang trả nợ bình thường. */
export const canPrepayLoan = (loan: ServicingLoanSummary): boolean =>
  loan.status === 'ACTIVE' && loan.principalOutstanding > 0;

/** Loan Service chỉ nhận đề nghị cơ cấu khi khoản vay ACTIVE hoặc DEFAULTED (`LOAN_NOT_ACTIVE`). */
export const canRescheduleLoan = (loan: ServicingLoanSummary): boolean =>
  loan.status === 'ACTIVE' || loan.status === 'DEFAULTED';

/**
 * Số tiền màn thanh toán sẽ thu: có quá hạn thì thu khoản quá hạn, không thì kỳ tới.
 * Cùng quy tắc với `LoanPaymentScreen` để thẻ báo đúng con số người vay sắp trả.
 */
export const dueAmountOf = (loan: ServicingLoanSummary): number =>
  loan.overdueAmount > 0 ? loan.overdueAmount : loan.nextDueAmount;

/**
 * Phần trăm gốc đã trả, chỉ để vẽ thanh tiến độ (không dùng để tính tiền). Kẹp trong
 * 0–100 phòng khi số liệu đồng bộ làm tròn dư một chút.
 */
export function principalPaidPercent(loan: ServicingLoanSummary): number {
  if (loan.principalAmount <= 0) return 0;
  const share = (loan.principalAmount - loan.principalOutstanding) / loan.principalAmount;
  return Math.round(Math.min(Math.max(share, 0), 1) * 100);
}

/** Dòng nghĩa vụ đáng chú ý nhất của một khoản vay: khoản quá hạn, hoặc kỳ tới. */
export type DueLine = { overdue: boolean; label: string; amount: string };

export function dueLineOf(loan: ServicingLoanSummary): DueLine | null {
  if (loan.overdueAmount > 0) {
    return {
      overdue: true,
      label: loan.daysPastDue > 0 ? `Quá hạn ${loan.daysPastDue} ngày` : 'Có khoản quá hạn',
      amount: formatDong(loan.overdueAmount),
    };
  }
  if (loan.status === 'SETTLED' || loan.status === 'WRITTEN_OFF' || !loan.nextDueDate) return null;
  return {
    overdue: false,
    label: `Kỳ tới ${formatLocalDate(loan.nextDueDate)}`,
    amount: formatDong(loan.nextDueAmount),
  };
}

/** Dữ liệu đã sẵn sàng để vẽ một thẻ ở màn "Khoản vay của tôi". */
export type LoanCardView = {
  loanNumber: string;
  status: StatusLook;
  outstanding: string;
  /** "Vay 30 triệu" — viết gọn khi đúng tuyệt đối, không thì ghi đủ số đồng. */
  principal: string;
  maturity: string;
  due: DueLine | null;
  /** Cả thẻ là một nút nên nhãn đọc phải gói đủ thông tin trên thẻ. */
  accessibilityLabel: string;
};

export function toLoanCardView(loan: ServicingLoanSummary): LoanCardView {
  const status = loanStatusLook(loan.status);
  const outstanding = formatDong(loan.totalOutstanding);
  const principal = `Vay ${formatMoneyShort(loan.principalAmount)}`;
  const maturity = `Đáo hạn ${formatLocalDate(loan.maturityDate)}`;
  const due = dueLineOf(loan);
  return {
    loanNumber: loan.loanNumber,
    status,
    outstanding,
    principal,
    maturity,
    due,
    accessibilityLabel:
      `Khoản vay ${loan.loanNumber}, ${status.label}. Dư nợ còn lại ${outstanding}. ` +
      `${principal}, ${maturity}.${due ? ` ${due.label}, ${due.amount}.` : ''}`,
  };
}

/** Bộ lọc đang chọn ở màn danh sách: một trạng thái, hoặc tất cả. */
export type LoanFilter = ServicingLoanStatus | 'all';
export type LoanChip = { key: LoanFilter; label: string; count: number };

/**
 * Chip "Tất cả" luôn có; mỗi trạng thái chỉ có chip khi có khoản vay, riêng chip đang
 * chọn vẫn giữ dù vừa về 0 sau lần tải lại. Trạng thái mới chưa có trong thứ tự cố
 * định xếp cuối thay vì biến mất khỏi bộ lọc (cùng cách màn "Hợp đồng của tôi").
 */
export function buildLoanChips(statuses: readonly ServicingLoanStatus[], selected: LoanFilter): LoanChip[] {
  const unknown = [...new Set(statuses)].filter(status => !LOAN_FILTER_ORDER.includes(status));
  const chips: LoanChip[] = [{ key: 'all', label: 'Tất cả', count: statuses.length }];
  for (const status of [...LOAN_FILTER_ORDER, ...unknown]) {
    const count = statuses.filter(item => item === status).length;
    if (count > 0 || status === selected) chips.push({ key: status, label: loanStatusLook(status).label, count });
  }
  return chips;
}

/** Kỳ trong lịch hợp đồng trùng ngày đến hạn kỳ tới của số liệu đồng bộ; lệch ngày thì không đánh dấu. */
export const nextPeriodOf = (loan: ServicingLoanSummary, periods: readonly SchedulePeriod[]): number | null =>
  loan.nextDueDate ? (periods.find(p => p.dueDate === loan.nextDueDate)?.period ?? null) : null;

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

/**
 * Bốn bước sau duyệt (tạo và phê duyệt lịch mới trên hệ thống lõi) là việc nội bộ;
 * người vay chỉ cần biết đề nghị đã duyệt và lịch mới đang được áp dụng.
 */
const RESCHEDULE_STATUS: Record<RescheduleStatus, StatusLook> = {
  PENDING_REVIEW: { label: 'Chờ thẩm định', tone: 'blue', icon: 'clock' },
  REJECTED: { label: 'Đã từ chối', tone: 'red', icon: 'circleX' },
  CREATE_PENDING: { label: 'Đã duyệt, chờ áp dụng', tone: 'blue', icon: 'refreshCw' },
  CREATING: { label: 'Đang áp dụng lịch mới', tone: 'blue', icon: 'refreshCw' },
  APPROVAL_PENDING: { label: 'Đang áp dụng lịch mới', tone: 'blue', icon: 'refreshCw' },
  APPROVING: { label: 'Đang áp dụng lịch mới', tone: 'blue', icon: 'refreshCw' },
  COMPLETED: { label: 'Đã áp dụng', tone: 'green', icon: 'circleCheck' },
  RECONCILIATION_REQUIRED: { label: 'Đang đối soát', tone: 'amber', icon: 'clockAlert' },
  MANUAL_REVIEW: { label: 'Đang kiểm tra thêm', tone: 'amber', icon: 'clockAlert' },
};

export const rescheduleStatusLook = (value: RescheduleStatus): StatusLook =>
  RESCHEDULE_STATUS[value] ?? { label: value, tone: 'gray', icon: 'info' };

/**
 * Đề nghị chưa kết thúc. Khớp chỉ mục `uq_loan_reschedule_one_active_per_loan` của Loan
 * Service: mỗi khoản vay chỉ có một đề nghị ngoài REJECTED/COMPLETED, gửi thêm sẽ bị
 * từ chối (`ACTIVE_RESTRUCTURE_REQUEST_EXISTS`).
 */
export const isActiveReschedule = (value: RescheduleStatus): boolean =>
  value !== 'REJECTED' && value !== 'COMPLETED';

/** Tên hai hình thức, dùng chung cho lựa chọn ở biểu mẫu và tiêu đề đề nghị đã gửi. */
export const RESCHEDULE_TYPE_LABEL = {
  TERM_EXTENSION: 'Gia hạn thêm kỳ',
  INSTALLMENT_ADJUSTMENT: 'Đổi ngày đến hạn',
} as const;

/** "Gia hạn thêm 3 kỳ", "Đổi ngày đến hạn sang 05/10/2026". */
export function rescheduleTitle(
  request: Pick<RescheduleRequest, 'requestType' | 'extraTerms' | 'adjustedDueDate'>,
): string {
  if (request.requestType === 'TERM_EXTENSION') {
    return request.extraTerms ? `Gia hạn thêm ${request.extraTerms} kỳ` : RESCHEDULE_TYPE_LABEL.TERM_EXTENSION;
  }
  if (request.requestType === 'INSTALLMENT_ADJUSTMENT') {
    return request.adjustedDueDate
      ? `Đổi ngày đến hạn sang ${formatLocalDate(request.adjustedDueDate)}`
      : RESCHEDULE_TYPE_LABEL.INSTALLMENT_ADJUSTMENT;
  }
  return request.requestType;
}

/** Một ngày đến hạn gợi ý cho ô "Áp dụng từ kỳ". */
export type DueDateOption = { date: string; caption: string };

/**
 * Fineract tra kỳ cần cơ cấu theo đúng ngày đến hạn (`rescheduleFromDate`) và từ chối kỳ
 * đã trả đủ; Loan Service chặn ngày trong quá khứ. Vì vậy gợi ý các ngày đến hạn sắp tới:
 * kỳ tới lấy từ số liệu đồng bộ của khoản vay (luôn mới nhất), các kỳ sau lấy từ lịch
 * trong hợp đồng.
 */
export function upcomingDueDates(
  loan: ServicingLoanSummary,
  periods: readonly SchedulePeriod[],
  today: string,
  limit: number,
): DueDateOption[] {
  const next = loan.nextDueDate && loan.nextDueDate >= today ? loan.nextDueDate : null;
  // Có kỳ tới thì các kỳ sau phải sau nó; không có thì nhận cả kỳ đến hạn đúng hôm nay.
  const later = periods
    .filter(p => (next ? p.dueDate > next : p.dueDate >= today))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const options: DueDateOption[] = next ? [{ date: next, caption: 'Kỳ tới' }] : [];
  for (const period of later) {
    if (options.length >= limit) break;
    options.push({ date: period.dueDate, caption: `Kỳ ${period.period}` });
  }
  return options;
}

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

export const parseDong = (value: string): number | null => {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const amount = Number(digits);
  return Number.isSafeInteger(amount) ? amount : null;
};
