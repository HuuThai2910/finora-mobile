import type { TagTone } from '@/components/ui';
import type { LoanContractStatus } from '@/types/contract';
import type { LoanApplicationStatus } from '@/types/loan';

export const APPLICATION_STATUS: Record<LoanApplicationStatus, { tone: TagTone; label: string }> = {
  SUBMITTED: { tone: 'blue', label: 'Đã nộp' },
  ELIGIBILITY_PENDING: { tone: 'amber', label: 'Chờ kiểm tra' },
  SCORING: { tone: 'amber', label: 'Đang chấm điểm' },
  SCORING_RETRY_PENDING: { tone: 'amber', label: 'Chờ chấm lại' },
  PENDING_REVIEW: { tone: 'blue', label: 'Chờ duyệt' },
  APPROVED: { tone: 'green', label: 'Đã duyệt — chờ xem hợp đồng' },
  REJECTED: { tone: 'red', label: 'Từ chối' },
  WITHDRAWN: { tone: 'gray', label: 'Đã rút' },
};

export const CONTRACT_STATUS: Record<LoanContractStatus, { tone: TagTone; label: string }> = {
  PENDING_SIGNATURE: { tone: 'amber', label: 'Chờ bạn ký' },
  SIGNED: { tone: 'green', label: 'Đã ký' },
  DECLINED: { tone: 'red', label: 'Đã từ chối' },
  EXPIRED: { tone: 'gray', label: 'Đã hết hạn' },
  EFFECTIVE: { tone: 'green', label: 'Đang hiệu lực' },
  COMPLETED: { tone: 'blue', label: 'Đã hoàn tất' },
};

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
