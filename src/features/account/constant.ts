import type { ImageSourcePropType } from 'react-native';
import type { Gender, KycStatus, UserRole } from '@/types/auth';
import type { LoanContractStatus } from '@/types/contract';
import type { TagTone } from '@/components/ui';
import type { IconName } from '@/constants/icons';
import { Colors } from '@/constants/colors';

export const KYC_TONE: Record<KycStatus, TagTone> = {
  NOT_STARTED: 'gray',
  PENDING_REVIEW: 'amber',
  KYC_VERIFIED: 'green',
  REJECTED: 'red',
};

export const KYC_LABEL: Record<KycStatus, string> = {
  NOT_STARTED: 'CHƯA ĐỊNH DANH',
  PENDING_REVIEW: 'CHỜ DUYỆT',
  KYC_VERIFIED: 'ĐÃ ĐỊNH DANH',
  REJECTED: 'BỊ TỪ CHỐI',
};

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

export const ROLE_LABEL: Record<UserRole, string> = {
  BORROWER: 'Người vay',
  INVESTOR: 'Nhà đầu tư',
  ADMIN: 'Quản trị viên',
};

export const LOGOUT_CONFIRM_TITLE = 'Đăng xuất?';
export const LOGOUT_CONFIRM_BODY = 'Bạn sẽ cần đăng nhập lại ở lần mở ứng dụng sau.';

/* ---------------- Màn "Hồ sơ" (mockup 26/09/2026) ---------------- */

/** Trên web và máy tính bảng, cột nội dung dừng ở bề rộng điện thoại như trang chủ. */
export const PROFILE_MAX_WIDTH = 480;

/**
 * Nền sóng dùng chung ảnh với màn "Sản phẩm vay" (857×1836). Chỉ lấy dải sóng
 * trên: từ hàng `wavesEnd` trở xuống ảnh đã là màu trơn `productsBackdrop`, nên
 * phần dưới thay bằng đúng màu đó thì không lộ vết nối, dù trang dài bao nhiêu.
 */
export const PROFILE_BACKGROUND = {
  source: require('@/assets/products-background.png') as ImageSourcePropType,
  width: 857,
  height: 1836,
  wavesEnd: 680,
};

/** Robot vẫy tay cầm thẻ căn cước (ảnh Hải tạo, đã cắt sát hình, 480×465). */
export const PROFILE_MASCOT = {
  source: require('@/assets/mascot-id-card.png') as ImageSourcePropType,
  aspectRatio: 480 / 465,
};

type KycBadgeLook = { icon: IconName; background: string; foreground: string };

/**
 * Màu và biểu tượng của nhãn định danh ở đầu màn. Chữ dùng tông đậm của tag để
 * đạt tương phản 4,5:1 trên nền nhạt; "chưa định danh" dùng tông hổ phách vì đó
 * là việc người dùng cần làm, không phải lỗi.
 */
export const KYC_BADGE: Record<KycStatus, KycBadgeLook> = {
  KYC_VERIFIED: { icon: 'shieldCheck', background: Colors.tintGreen, foreground: Colors.tagGreenText },
  NOT_STARTED: { icon: 'shieldAlert', background: Colors.amberBg, foreground: Colors.tagAmberText },
  PENDING_REVIEW: { icon: 'clock', background: Colors.amberBg, foreground: Colors.tagAmberText },
  REJECTED: { icon: 'shieldAlert', background: Colors.redBg, foreground: Colors.tagRedText },
};

/**
 * Hợp đồng đã ký hoặc đang hiệu lực là khoản vay người dùng đang (sắp) phải trả.
 * Hợp đồng chờ ký, bị từ chối, hết hạn hay đã tất toán thì không còn lịch cần
 * theo dõi, nên lối tắt "Lịch trả nợ" không mở thẳng vào chúng.
 */
export const SCHEDULE_CONTRACT_STATUSES: readonly LoanContractStatus[] = ['SIGNED', 'EFFECTIVE'];

/** Chữ phụ của mục chưa có chức năng thật — nói thẳng thay vì hiện số liệu mẫu. */
export const COMING_SOON = 'Sắp có';

/** Một mục cài đặt của mockup mà app chưa có màn, API hay dữ liệu thật. */
export type UpcomingSetting = { icon: IconName; title: string };

/**
 * Nhóm "Bảo mật & Liên kết" của mockup. Chưa mục nào có chức năng thật nên đều
 * hiện mờ, không bấm được:
 * - Ngân hàng liên kết: `linkedBank` của `GET /users/me` chưa có contract (luôn
 *   rỗng), miền ví vẫn chạy dữ liệu giả;
 * - Sinh trắc học: app chưa tích hợp xác thực sinh trắc;
 * - Thiết bị đăng nhập: `finora-user` chưa có API danh sách phiên/thiết bị;
 * - Chữ ký số: SmartCA chỉ dùng khi ký từng hợp đồng, chưa có màn quản lý chứng thư.
 */
export const SECURITY_SETTINGS: readonly UpcomingSetting[] = [
  { icon: 'bank', title: 'Ngân hàng liên kết' },
  { icon: 'scanFace', title: 'Sinh trắc học (Face ID)' },
  { icon: 'shield', title: 'Thiết bị đăng nhập' },
  { icon: 'penLine', title: 'Chữ ký số' },
];

/**
 * Nhóm "Thông báo & Cài đặt": chưa có màn cài đặt thông báo (màn Thông báo ở
 * trang chủ chỉ là hộp thư) và chưa có trang điều khoản trong app.
 */
export const NOTIFICATION_SETTINGS: readonly UpcomingSetting[] = [
  { icon: 'bell', title: 'Cài đặt thông báo' },
  { icon: 'fileCog', title: 'Điều khoản' },
];
