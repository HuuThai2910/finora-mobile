import type { IconName } from '@/constants/icons';
import type { RepaymentPreview, RepaymentPreviewRequest, SchedulePeriod } from '@/types/loan';
import { formatDong, formatLocalDate, formatMoneyShort } from '@/utils/format';
import { REPAYMENT_METHOD_LABEL } from '../constant';

/**
 * Dữ liệu hiển thị của bước 2/3 "Xác nhận khoản vay". Mọi con số lấy nguyên từ
 * preview của backend (hoặc từ lựa chọn ở bước 1, như màn cũ), ở đây chỉ định
 * dạng — không cộng trừ, không làm tròn lại.
 */
export type ScheduleSummaryView = {
  /** Số tiền người vay chọn ở bước 1: "50.000.000 đ". */
  amount: string;
  /** "12 tháng · lãi suất cơ sở 12,50%/năm". */
  terms: string;
  /** Như `terms` nhưng ngăn bằng dấu phẩy, để trình đọc màn hình không đọc "chấm giữa". */
  spokenTerms: string;
  firstInstallment: string;
  maximumInstallment: string;
  totalRepayment: ScheduleTotalView;
  totalInterest: ScheduleTotalView;
  method: string;
};

/** Số tiền của ô tổng trả / tổng lãi. */
export type ScheduleTotalView = {
  /** Viết gọn khi đúng tuyệt đối ("53,45 triệu"), không thì ghi đủ số đồng ("53.456.000 đ"). */
  text: string;
  /** Không viết gọn được: chuỗi dài gần gấp rưỡi, ô cần cỡ chữ nhỏ hơn để vừa một dòng. */
  exact: boolean;
};

export type SchedulePartView = {
  key: 'principal' | 'interest' | 'fees' | 'penalties';
  icon: IconName;
  label: string;
  value: string;
};

export type SchedulePeriodView = {
  title: string;
  /** Chữ trên chip: "25/10/2026 → 25/11/2026 · 31 ngày". */
  range: string;
  /** Câu đọc cho trình đọc màn hình, thay cho mũi tên và dấu chấm giữa. */
  spokenRange: string;
  totalDue: string;
  parts: SchedulePartView[];
  balance: string;
};

// Backend giữ lãi suất tới 4 chữ số lẻ: hiện tối thiểu 2 chữ số như mockup
// ("12,50%/năm") và tối đa 4 để không làm tròn sai mức lãi đã công bố.
const rateFormat = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

function toTotalView(amount: number): ScheduleTotalView {
  const text = formatMoneyShort(amount);
  // `formatMoneyShort` chỉ trả về đúng dạng đủ số đồng khi không viết gọn được.
  return { text, exact: text === formatDong(amount) };
}

export function toScheduleSummaryView(
  preview: RepaymentPreview,
  request: RepaymentPreviewRequest,
): ScheduleSummaryView {
  const term = `${request.termMonths} tháng`;
  const rate = `lãi suất cơ sở ${rateFormat.format(preview.annualInterestRate)}%/năm`;
  return {
    amount: formatDong(request.amount),
    terms: `${term} · ${rate}`,
    spokenTerms: `${term}, ${rate}`,
    firstInstallment: formatDong(preview.firstInstallment),
    maximumInstallment: formatDong(preview.maximumInstallment),
    totalRepayment: toTotalView(preview.totalRepayment),
    totalInterest: toTotalView(preview.totalInterest),
    // Enum mới chưa có nhãn thì hiện nguyên mã thay vì bỏ trống, để còn tra được.
    method: REPAYMENT_METHOD_LABEL[preview.repaymentMethod] ?? preview.repaymentMethod,
  };
}

export function toSchedulePeriodView(period: SchedulePeriod): SchedulePeriodView {
  // Ngày của kỳ là `LocalDate` của backend: tách chuỗi, không qua `new Date`, để
  // máy ở múi giờ âm không hiện lùi một ngày.
  const from = formatLocalDate(period.fromDate);
  const due = formatLocalDate(period.dueDate);
  // Kiểu TS ghi `number` nhưng Loan Service để null khi Fineract không trả số
  // ngày của kỳ; khi đó bỏ hẳn phần "· N ngày" chứ không in "null ngày".
  const days = typeof period.daysInPeriod === 'number' ? period.daysInPeriod : null;

  return {
    title: `Kỳ ${period.period}`,
    range: days === null ? `${from} → ${due}` : `${from} → ${due} · ${days} ngày`,
    spokenRange: days === null ? `từ ${from} đến ${due}` : `từ ${from} đến ${due}, ${days} ngày`,
    totalDue: formatDong(period.totalDue),
    parts: [
      { key: 'principal', icon: 'coins', label: 'Tiền gốc', value: formatDong(period.principal) },
      { key: 'interest', icon: 'percent', label: 'Tiền lãi', value: formatDong(period.interest) },
      { key: 'fees', icon: 'fileText', label: 'Phí', value: formatDong(period.fees) },
      { key: 'penalties', icon: 'shield', label: 'Phạt dự kiến', value: formatDong(period.penalties) },
    ],
    balance: formatDong(period.outstandingBalance),
  };
}
