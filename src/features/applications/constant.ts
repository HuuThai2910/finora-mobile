import type { TagTone } from '@/components/ui';
import type { LoanApplicationStatus } from '@/types/loan';
import type { RepaymentPeriodRow } from '@/types/contract';

export const APPLICATION_STATUS: Record<LoanApplicationStatus, { tone: TagTone; label: string }> = {
  SUBMITTED: { tone: 'blue', label: 'Đã nộp' },
  ELIGIBILITY_PENDING: { tone: 'amber', label: 'Chờ kiểm tra' },
  SCORING: { tone: 'amber', label: 'Đang chấm điểm' },
  SCORING_RETRY_PENDING: { tone: 'amber', label: 'Chờ chấm lại' },
  PENDING_REVIEW: { tone: 'blue', label: 'Chờ duyệt' },
  REJECTED: { tone: 'red', label: 'Từ chối' },
  WITHDRAWN: { tone: 'gray', label: 'Đã rút' },
};

export const PERIOD_STATUS: Record<RepaymentPeriodRow['status'], { tone: TagTone; label: string }> = {
  PAID: { tone: 'green', label: 'Đã trả' },
  DUE_SOON: { tone: 'amber', label: 'Sắp đến hạn' },
  UPCOMING: { tone: 'gray', label: 'Chưa đến' },
  OVERDUE: { tone: 'red', label: 'Quá hạn' },
};

/**
 * Luồng vay còn hai bước: tạo hồ sơ → chấm điểm rồi nộp.
 * Bước ký hợp đồng số đã được tạm ẩn theo yêu cầu.
 */
export const APPLY_STEPS = 2;

/** Kỳ hạn cho phép khi tái cơ cấu — mockup đưa ra ba lựa chọn. */
export const RESTRUCTURE_OPTIONS = [15, 18, 24] as const;

/* ---------------- Giá trị khớp enum của `finora-loan` ---------------- */

/** `com.finora.loan.domain.HomeOwnership` — trường bắt buộc khi nộp hồ sơ. */
export const HOME_OWNERSHIP_OPTIONS = [
  { value: 'RENT' as const, label: 'Đi thuê' },
  { value: 'OWN' as const, label: 'Sở hữu' },
  { value: 'MORTGAGE' as const, label: 'Trả góp' },
  { value: 'OTHER' as const, label: 'Khác' },
];

/** `com.finora.loan.domain.EducationLevel` — trường tùy chọn. */
export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'HIGH_SCHOOL' as const, label: 'THPT' },
  { value: 'COLLEGE' as const, label: 'Cao đẳng' },
  { value: 'UNIVERSITY' as const, label: 'Đại học' },
  { value: 'POSTGRADUATE' as const, label: 'Sau đại học' },
  { value: 'OTHER' as const, label: 'Khác' },
];

/**
 * Backend so khớp chính xác chuỗi này với `finora.loan.pricing-disclosure-version`
 * (mặc định `RATE_DISCLOSURE_V1`); sai một ký tự là hồ sơ bị từ chối với mã
 * `PRICING_DISCLOSURE_OUTDATED`. Chưa có endpoint công bố giá trị này nên phải
 * cấu hình phía client cho khớp.
 */
export const PRICING_DISCLOSURE_VERSION =
  process.env.EXPO_PUBLIC_PRICING_DISCLOSURE_VERSION ?? 'RATE_DISCLOSURE_V1';

export const PRICING_DISCLOSURE_TEXT =
  'Tôi đã xem lãi suất, phí và lịch trả nợ dự kiến của sản phẩm này.';

/* ---------------- Chuyển đổi sang schema của `finora-ai` ---------------- */

/**
 * `finora-loan` nhận thâm niên theo số tháng, còn mô hình trong `finora-ai`
 * học trên chuỗi kiểu LendingClub ("< 1 year", "5 years", "10+ years").
 * Trả `undefined` khi người dùng bỏ trống để bộ dự đoán tự điền bằng median —
 * không bịa ra một con số.
 */
export function toEmpLength(months: number | null): string | undefined {
  if (months === null || Number.isNaN(months)) return undefined;
  const years = Math.floor(months / 12);
  if (years < 1) return '< 1 year';
  if (years >= 10) return '10+ years';
  return years === 1 ? '1 year' : `${years} years`;
}

export const DECISION_LABEL = {
  APPROVED: 'Đủ điều kiện',
  PENDING_REVIEW: 'Cần duyệt tay',
  REJECTED: 'Không đạt',
} as const;

export const DECISION_TONE = {
  APPROVED: 'green',
  PENDING_REVIEW: 'amber',
  REJECTED: 'red',
} as const;

export const FUNDING_FAIL_NOTE =
  'Không đủ 100% đúng hạn → tự hủy, hoàn phong tỏa cho nhà đầu tư';

export const SIGN_CHAIN_NOTE = 'ghi Proof of Existence lên Fabric sau khi đủ chữ ký';

export const SIGN_AFTER_NOTE = 'Ký xong + đủ 100% vốn → saga giải ngân tự chạy';

export const RESTRUCTURE_NOTE =
  'Cần admin duyệt + đồng thuận nhà đầu tư · tổng kỳ hạn theo trần sản phẩm';

export const DECLINING_NOTE = (outstanding: string) =>
  `Lãi giảm dần trên dư nợ gốc — Fineract tự sinh lịch, gốc còn lại ${outstanding}`;
