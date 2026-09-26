import type { ImageSourcePropType } from 'react-native';
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
  SIGNING: {
    tone: 'amber',
    label: 'Đang chờ SmartCA',
    icon: 'clock',
    meaning: 'Yêu cầu ký đã được gửi tới VNPT SmartCA và đang chờ bạn xác nhận.',
    next: 'Mở ứng dụng SmartCA, xác nhận rồi quay lại kiểm tra kết quả',
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

/**
 * Icon của thẻ hồ sơ theo mục đích vay — trường có cấu trúc duy nhất nói hồ sơ
 * vay để làm gì (contract không có "loại sản phẩm"). `OTHER` và mã backend mới
 * bổ sung dùng icon hồ sơ trung tính thay vì đoán từ tên sản phẩm do admin đặt.
 */
export const PURPOSE_ICONS: Partial<Record<string, IconName>> = {
  DEBT_CONSOLIDATION: 'layers',
  CREDIT_CARD: 'creditCard',
  HOME_IMPROVEMENT: 'home',
  MAJOR_PURCHASE: 'shoppingBag',
  MEDICAL: 'heartPulse',
  CAR: 'car',
  SMALL_BUSINESS: 'briefcase',
  MOVING: 'truck',
  VACATION: 'plane',
  EDUCATION: 'graduationCap',
};

export const NEUTRAL_PURPOSE_ICON: IconName = 'fileText';

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
 * (mặc định `RATE_DISCLOSURE_V2`); sai một ký tự là hồ sơ bị từ chối với mã
 * `PRICING_DISCLOSURE_OUTDATED`. Chưa có endpoint công bố giá trị này nên phải
 * cấu hình phía client cho khớp.
 */
export const PRICING_DISCLOSURE_VERSION =
  process.env.EXPO_PUBLIC_PRICING_DISCLOSURE_VERSION ?? 'RATE_DISCLOSURE_V2';

export const PRICING_DISCLOSURE_TEXT =
  'Tôi đã xem lãi suất cơ sở, khung lãi suất, phí và lịch trả ban đầu. Tôi đồng ý hồ sơ tự tiếp tục nếu điều khoản cuối không bất lợi hơn; nếu lãi, phí hoặc nghĩa vụ trả tăng, FINORA phải hỏi lại trước khi lập hợp đồng.';

/* ---------------- Màn "Hồ sơ vay" (mockup 26/09/2026) ---------------- */

/** Trên web và máy tính bảng, giữ cột nội dung cỡ điện thoại thay vì giãn theo cửa sổ. */
export const APPLICATION_LIST_MAX_WIDTH = 480;

/** Lề hai bên của mockup (hẹp hơn lề 20 của các màn cũ, thẻ gần mép hơn). */
export const APPLICATION_LIST_PADDING = 16;

export type ApplicationsBackground = {
  source: ImageSourcePropType;
  width: number;
  height: number;
  /**
   * Hàng cắt đôi ảnh. Nửa trên (sóng + hình minh hoạ) cuộn cùng đầu trang, nửa
   * dưới (sóng đáy) đứng yên ở đáy màn; khoảng hở giữa hai nửa lấp bằng đúng
   * màu hàng này (`Colors.applicationsBackdrop`) nên không lộ vết nối.
   */
  splitRow: number;
  /** Mép trái cụm minh hoạ (tờ giấy nhỏ bay bên trái), theo pixel ảnh gốc. */
  illustrationLeft: number;
  /** Mép dưới cụm minh hoạ, tính cả quầng sáng dưới huy hiệu dấu tích. */
  illustrationBottom: number;
};

/**
 * Ảnh nền của màn (1024×1536, Hải tạo bằng ChatGPT). Màn dài hơn ảnh theo tỉ
 * lệ, kéo giãn thì méo sóng, nên ảnh chỉ phóng theo bề rộng cột rồi cắt đôi.
 * Các mốc đo bằng PIL trên ảnh gốc.
 */
export const APPLICATIONS_BACKGROUND: ApplicationsBackground = {
  source: require('@/assets/applications-background.png'),
  width: 1024,
  height: 1536,
  splitRow: 800,
  illustrationLeft: 490,
  illustrationBottom: 332,
};

/**
 * Nhóm lọc ở màn "Hồ sơ vay". Mỗi hồ sơ thuộc đúng một nhóm, suy từ cùng bộ ba
 * trạng thái (hồ sơ, hợp đồng, xác nhận điều khoản) mà `applicationJourneyStatus`
 * dùng để in nhãn trên thẻ — xem `mappers/applicationStage.ts`.
 */
export type ApplicationStage = 'action' | 'signed' | 'reviewing' | 'rejected' | 'stopped' | 'other';

/**
 * Thứ tự chip cố định, không đổi theo dữ liệu để chip không nhảy chỗ sau mỗi
 * lần tải lại: việc người vay cần làm trước, rồi khoản đã ký, hồ sơ đang xét,
 * cuối cùng là các hồ sơ đã khép lại.
 */
export const APPLICATION_STAGES: readonly { key: ApplicationStage; label: string }[] = [
  { key: 'action', label: 'Chờ bạn xử lý' },
  { key: 'signed', label: 'Đã ký' },
  { key: 'reviewing', label: 'Đang xét duyệt' },
  { key: 'rejected', label: 'Không được duyệt' },
  { key: 'stopped', label: 'Đã dừng' },
  { key: 'other', label: 'Trạng thái khác' },
];

/* ---------------- Màn "Chi tiết hồ sơ vay" (mockup 26/09/2026) ---------------- */

/**
 * Nhãn ngắn của phương thức trả cho ô thông số hẹp ở thẻ tóm tắt; câu đầy đủ
 * vẫn là `REPAYMENT_LABELS` ở thẻ thanh toán và phần thông tin đã gửi.
 */
export const REPAYMENT_SHORT_LABELS: Record<string, string> = {
  ANNUITY: 'Trả góp đều',
  EQUAL_PRINCIPAL: 'Gốc đều',
};

/**
 * Mép trái vật thể gần nhất nằm ngang hàng tiêu đề màn chi tiết (tờ giấy mờ bay
 * phía trên tập hồ sơ), theo pixel ảnh `applications-background.png`, đo bằng
 * PIL. Tiêu đề và mã hồ sơ dừng trước mốc này nên không đè lên hình minh hoạ;
 * `illustrationLeft` (490) nằm thấp hơn hàng chữ nên không dùng làm giới hạn.
 */
export const DETAIL_HEADER_TEXT_LIMIT = 630;

/* ---------------- Màn "Nộp hồ sơ" — bước 3/3 (mockup 26/09/2026) ---------------- */

/**
 * Bảng chọn (mục đích vay, học vấn, nhà ở) mở ngoài cột nội dung nên tự giới hạn
 * bề rộng, khớp cột 480pt của `LoanStepBackdrop` bên products.
 */
export const APPLY_FORM_SHEET_MAX_WIDTH = 480;

/**
 * Bo góc chung của dòng nhập, hộp ghi chú và ô xác nhận ở bước 3/3 (mockup ≈14pt,
 * nằm giữa `Radius.sm` và `Radius.md`); thẻ khoản vay đã chọn dùng `Radius.md`.
 */
export const APPLY_FORM_BOX_RADIUS = 14;

/* ---------------- Màn "Hợp đồng của tôi" (mockup 26/09/2026) ---------------- */

/**
 * Các mốc của hình minh hoạ trong `contracts-background.png` (pixel ảnh gốc, đo
 * bằng PIL). Ảnh đặt sát mép trên màn như mockup, không lùi theo vùng an toàn.
 */
export const CONTRACT_LIST_ART = {
  /** Đỉnh đầu linh vật xanh: hàng tiêu đề nằm trọn phía trên mốc này thì không cần né hình. */
  top: 150,
  /** Mép dưới cụm linh vật + chậu lá: hàng chip lọc bắt đầu từ đây. */
  bottom: 299,
  /** Mép trái đầu linh vật xanh (hàng 150–210) — vật gần nhất ngang hàng tiêu đề. */
  titleLimit: 467,
} as const;

/**
 * Thứ tự chip lọc ở màn hợp đồng, cố định để chip không nhảy chỗ sau mỗi lần tải
 * lại: việc cần người vay làm trước, rồi hợp đồng đã ký, cuối cùng là hợp đồng đã
 * khép lại. Chip dùng đúng nhãn trạng thái trên thẻ (`CONTRACT_STATUS`).
 */
export const CONTRACT_FILTER_ORDER: readonly LoanContractStatus[] = [
  'PENDING_SIGNATURE',
  'SIGNING',
  'SIGNED',
  'EFFECTIVE',
  'COMPLETED',
  'EXPIRED',
  'DECLINED',
];
