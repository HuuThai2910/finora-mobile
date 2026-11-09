import type { KycStatus } from '@/types/auth';

/** Mã lỗi Investment trả khi token chưa mang claim `ekyc_status = VERIFIED`. */
export const EKYC_REQUIRED_CODE = 'EKYC_REQUIRED';

export type EkycGateCopy = {
  title: string;
  message: string;
  /** Nút chính: mở luồng eKYC, hoặc chỉ kiểm tra lại khi hồ sơ đang chờ duyệt. */
  action: { label: string; kind: 'start' | 'recheck' };
};

/**
 * Lời báo khi một thao tác cần đã định danh (góp vốn, đặt lệnh Note).
 * `doing` là cụm động từ của thao tác, ví dụ "đầu tư", "giao dịch Note".
 */
export function ekycGateCopy(status: KycStatus, doing: string): EkycGateCopy {
  switch (status) {
    case 'PENDING_REVIEW':
      return {
        title: 'Hồ sơ định danh đang chờ duyệt',
        message: `FINORA đang duyệt hồ sơ eKYC của bạn. Bạn ${doing} được ngay khi hồ sơ được duyệt.`,
        action: { label: 'Kiểm tra lại', kind: 'recheck' },
      };
    case 'REJECTED':
      return {
        title: 'Hồ sơ định danh chưa được duyệt',
        message: `Bạn cần xác minh lại danh tính (eKYC) trước khi ${doing}.`,
        action: { label: 'Xác minh lại', kind: 'start' },
      };
    case 'KYC_VERIFIED':
      // Hồ sơ đã duyệt nhưng máy chủ vẫn chưa nhận: phiên đăng nhập mang trạng thái cũ.
      return {
        title: 'Chưa cập nhật trạng thái định danh',
        message: `Hồ sơ của bạn đã được xác minh nhưng phiên đăng nhập chưa cập nhật. Đăng xuất rồi đăng nhập lại để ${doing}.`,
        action: { label: 'Kiểm tra lại', kind: 'recheck' },
      };
    default:
      return {
        title: 'Bạn chưa xác minh danh tính',
        message: `Bạn cần hoàn tất eKYC (chụp CCCD và kiểm tra khuôn mặt) trước khi ${doing}. Chỉ mất khoảng 2 phút.`,
        action: { label: 'Xác minh ngay', kind: 'start' },
      };
  }
}
