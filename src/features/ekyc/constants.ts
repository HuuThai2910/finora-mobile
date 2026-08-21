import type { EkycResultCode } from '@/types/ekyc';
import type { CccdSide } from './hooks/useEkycSession';

/** Ảnh CCCD giữ độ phân giải cao vì OCR cần đọc được chữ nhỏ. */
export const CCCD_WIDTH = 1280;

/** Chất lượng nén JPEG khi chuyển sang base64. */
export const CCCD_QUALITY = 0.8;

/** Chiều cao khung ngắm CCCD — tia quét phải chạy đúng trong khoảng này. */
export const CCCD_FRAME_HEIGHT = 260;

export const CAPTURE_HINT = 'Đặt CCCD trong khung, đủ sáng, không loá và không che góc';

/** Tiêu đề và phụ đề màn chụp theo mặt thẻ. */
export const CAPTURE_TITLE: Record<CccdSide, string> = {
  front: 'Chụp mặt trước CCCD',
  back: 'Chụp mặt sau CCCD',
};

export const CAPTURE_SUB: Record<CccdSide, string> = {
  front: 'Mặt có ảnh chân dung, thẻ nằm gọn trong khung',
  back: 'Mặt có dòng MRZ và ngày cấp, thẻ nằm gọn trong khung',
};

/** Nhãn dự phòng khi server không kèm `message`. */
export const RESULT_FALLBACK_MESSAGE: Record<EkycResultCode, string> = {
  DRAFT_READY: 'Kiểm tra thông tin đọc được từ CCCD rồi xác nhận',
  DRAFT_EXPIRED: 'Phiên xác minh đã hết hạn, vui lòng quét lại CCCD',
  VERIFIED: 'Xác minh thành công',
  OCR_FAILED: 'Không đọc được thông tin trên ảnh mặt trước CCCD',
  ID_MISMATCH: 'Số CCCD trên ảnh không khớp hồ sơ',
  ID_TAKEN: 'Số CCCD này đã được đăng ký trong hệ thống',
  RATE_LIMITED: 'Bạn thao tác quá nhanh',
  AI_UNAVAILABLE: 'Dịch vụ xác minh đang bận',
};

/** Cảnh báo trường mềm — hiển thị để người dùng biết cần kiểm tra lại hồ sơ. */
export const WARNING_LABELS: Record<string, string> = {
  FULL_NAME_MISMATCH: 'Họ tên trên ảnh khác hồ sơ',
  DOB_MISMATCH: 'Ngày sinh trên ảnh khác hồ sơ',
};
