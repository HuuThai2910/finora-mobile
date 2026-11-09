import type { BorrowerKycStatus, LoanDecisionSource } from '@/types/invest';

/**
 * Nhãn và cách viết số của hồ sơ người vay. Chỉ đổi cách hiển thị, không tính lại con số nào:
 * mọi giá trị đã do Loan/AI tính sẵn.
 */

/** Theo enum `HomeOwnership` của Loan. */
export const HOME_OWNERSHIP_LABEL: Record<string, string> = {
  OWN: 'Nhà thuộc sở hữu',
  MORTGAGE: 'Đang trả góp nhà',
  RENT: 'Đi thuê',
  OTHER: 'Khác',
};

/** Theo enum `EducationLevel` của Loan. */
export const EDUCATION_LABEL: Record<string, string> = {
  HIGH_SCHOOL: 'Trung học phổ thông',
  COLLEGE: 'Cao đẳng',
  UNIVERSITY: 'Đại học',
  POSTGRADUATE: 'Sau đại học',
  OTHER: 'Khác',
};

export const KYC_LABEL: Record<BorrowerKycStatus, string> = {
  VERIFIED: 'Đã xác minh',
  PENDING: 'Chờ xác minh',
  PROCESSING: 'Đang xác minh',
  REJECTED: 'Bị từ chối',
  EXPIRED: 'Đã hết hạn',
  UNKNOWN: 'Không rõ',
};

export const DECISION_SOURCE_LABEL: Record<LoanDecisionSource, string> = {
  AI_POLICY: 'Tự động theo chính sách',
  ADMIN: 'Chuyên viên thẩm định',
  UNKNOWN: 'Không rõ',
};

const NUMBER = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const plain = (value: number) => NUMBER.format(value);

/** Điểm đánh giá: 68.92 → "68,92". */
export const formatScore = plain;

/** Thâm niên theo tháng → "10 năm", "2 năm 3 tháng", "8 tháng". */
export function formatEmployment(months: number | null): string {
  if (months == null) return 'Chưa cung cấp';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} tháng`;
  return rest === 0 ? `${years} năm` : `${years} năm ${rest} tháng`;
}
