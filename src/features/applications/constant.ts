import type { TagTone } from '@/components/ui';
import type { IconName } from '@/constants/icons';
import type { LoanContractStatus } from '@/types/contract';
import type { LoanApplicationStatus } from '@/types/loan';

/**
 * Mỗi trạng thái cần ba mẩu thông tin khác nhau cho người vay:
 * nhãn ngắn (tag), câu giải thích trạng thái đó nghĩa là gì, và việc sẽ xảy ra
 * kế tiếp. Trước đây chỉ có nhãn nên người vay không biết mình đang chờ gì.
 * `next` để trống ở trạng thái kết thúc — không còn bước nào phía sau.
 */
export type StatusMeta = {
  tone: TagTone;
  label: string;
  icon: IconName;
  meaning: string;
  next: string | null;
};

export const APPLICATION_STATUS: Record<LoanApplicationStatus, StatusMeta> = {
  SUBMITTED: {
    tone: 'blue',
    label: 'Đã nộp',
    icon: 'check',
    meaning: 'FINORA đã nhận hồ sơ của bạn.',
    next: 'Hệ thống kiểm tra điều kiện vay',
  },
  ELIGIBILITY_PENDING: {
    tone: 'amber',
    label: 'Đang kiểm tra điều kiện',
    icon: 'search',
    meaning: 'Hệ thống đang đối chiếu hồ sơ với điều kiện của sản phẩm vay.',
    next: 'Chấm điểm tín dụng',
  },
  SCORING: {
    tone: 'amber',
    label: 'Đang chấm điểm',
    icon: 'robot',
    meaning: 'Mô hình tín dụng đang đánh giá hồ sơ. Việc này thường mất vài phút.',
    next: 'Chuyên viên xem xét hồ sơ',
  },
  SCORING_RETRY_PENDING: {
    tone: 'amber',
    label: 'Chờ chấm điểm lại',
    icon: 'clock',
    meaning: 'Lần chấm điểm trước chưa hoàn tất nên hệ thống sẽ tự chạy lại.',
    next: 'Chấm điểm tín dụng lại',
  },
  PENDING_REVIEW: {
    tone: 'blue',
    label: 'Chờ duyệt',
    icon: 'users',
    meaning: 'Chuyên viên đang xem hồ sơ của bạn. Đây là bước bình thường, không phải lỗi.',
    next: 'Có kết quả duyệt hồ sơ',
  },
  APPROVED: {
    tone: 'green',
    label: 'Đã duyệt',
    icon: 'check',
    meaning: 'Hồ sơ được duyệt. Hợp đồng vay đã sẵn sàng để bạn đọc và ký.',
    next: 'Bạn đọc và ký hợp đồng vay',
  },
  REJECTED: {
    tone: 'red',
    label: 'Không được duyệt',
    icon: 'x',
    meaning: 'Hồ sơ này không được duyệt. Bạn có thể nộp hồ sơ mới khi điều kiện thay đổi.',
    next: null,
  },
  WITHDRAWN: {
    tone: 'gray',
    label: 'Đã rút',
    icon: 'x',
    meaning: 'Bạn đã rút hồ sơ này nên FINORA dừng xử lý.',
    next: null,
  },
};

export const CONTRACT_STATUS: Record<LoanContractStatus, StatusMeta> = {
  PENDING_SIGNATURE: {
    tone: 'amber',
    label: 'Chờ bạn ký',
    icon: 'pen',
    meaning: 'Hợp đồng đã chốt điều khoản và đang chờ bạn xác nhận.',
    next: 'Bạn ký xác nhận trước hạn',
  },
  SIGNED: {
    tone: 'green',
    label: 'Đã ký',
    icon: 'check',
    meaning: 'FINORA đã ghi nhận xác nhận của bạn.',
    next: 'Hợp đồng chuyển sang hiệu lực',
  },
  DECLINED: {
    tone: 'red',
    label: 'Đã từ chối',
    icon: 'x',
    meaning: 'Bạn đã từ chối hợp đồng này nên khoản vay không được thiết lập.',
    next: null,
  },
  EXPIRED: {
    tone: 'gray',
    label: 'Đã hết hạn',
    icon: 'clock',
    meaning: 'Hợp đồng quá hạn xác nhận nên không còn ký được.',
    next: null,
  },
  EFFECTIVE: {
    tone: 'green',
    label: 'Đang hiệu lực',
    icon: 'shield',
    meaning: 'Hợp đồng đã có hiệu lực giữa bạn và FINORA.',
    next: 'Giải ngân theo hợp đồng',
  },
  COMPLETED: {
    tone: 'blue',
    label: 'Đã hoàn tất',
    icon: 'check',
    meaning: 'Khoản vay theo hợp đồng này đã kết thúc.',
    next: null,
  },
};

/** Trạng thái mà backend còn cho phép borrower rút hồ sơ. */
export const WITHDRAWABLE_STATUSES: readonly LoanApplicationStatus[] = [
  'SUBMITTED',
  'ELIGIBILITY_PENDING',
  'SCORING',
  'SCORING_RETRY_PENDING',
  'PENDING_REVIEW',
];

export const PURPOSE_LABELS: Record<string, string> = {
  DEBT_CONSOLIDATION: 'Hợp nhất các khoản nợ',
  CREDIT_CARD: 'Thanh toán dư nợ thẻ',
  HOME_IMPROVEMENT: 'Sửa chữa nhà',
  MAJOR_PURCHASE: 'Mua sắm tài sản có giá trị',
  MEDICAL: 'Chi phí y tế',
  CAR: 'Mua hoặc sửa chữa xe',
  SMALL_BUSINESS: 'Vốn kinh doanh nhỏ',
  MOVING: 'Chi phí chuyển nơi ở',
  VACATION: 'Du lịch',
  EDUCATION: 'Chi phí giáo dục',
  OTHER: 'Khác',
};

export const REPAYMENT_LABELS: Record<string, string> = {
  ANNUITY: 'Trả góp đều hằng kỳ',
  EQUAL_PRINCIPAL: 'Gốc đều, lãi giảm dần',
};

export type DeclineReasonCode = 'TERMS_NOT_ACCEPTED' | 'BORROWER_CHANGED_MIND' | 'OTHER';

export const DECLINE_REASONS: readonly { value: DeclineReasonCode; label: string }[] = [
  { value: 'TERMS_NOT_ACCEPTED', label: 'Không đồng ý điều khoản' },
  { value: 'BORROWER_CHANGED_MIND', label: 'Thay đổi nhu cầu' },
  { value: 'OTHER', label: 'Lý do khác' },
];

export const ACTOR_LABELS: Record<'BORROWER' | 'ADMIN' | 'SYSTEM', string> = {
  BORROWER: 'Bạn',
  ADMIN: 'Chuyên viên FINORA',
  SYSTEM: 'Hệ thống',
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
  'Tôi đã xem lãi suất cơ sở, khung lãi suất có thể áp dụng, phí và lịch trả nợ ban đầu. Tôi hiểu lãi suất cuối có thể tăng hoặc giảm sau đánh giá và sẽ được xem lại trước khi ký hợp đồng.';
