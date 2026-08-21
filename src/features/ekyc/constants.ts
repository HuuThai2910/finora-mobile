import type { EkycResultCode, LivenessActionCode } from '@/types/ekyc';

/** Nhãn tiếng Việt cho động tác server yêu cầu. */
export const ACTION_LABELS: Record<LivenessActionCode, string> = {
  blink: 'Nháy mắt một lần',
  turn_left: 'Quay đầu sang trái rồi nhìn thẳng lại',
  turn_right: 'Quay đầu sang phải rồi nhìn thẳng lại',
};

/**
 * Số frame gửi lên. Backend yêu cầu tối thiểu 3 và tối đa 20
 * (`EkycVerifyRequest.MIN_FRAMES` / `MAX_FRAMES`); lấy 12 để đủ bắt trọn hai
 * động tác mà payload vẫn dưới ngưỡng chấp nhận được trên mạng di động.
 */
export const FRAME_COUNT = 12;

/** Dưới ngưỡng này backend từ chối request, nên chặn ngay ở client. */
export const MIN_FRAMES = 3;

/**
 * Khoảng cách **tối thiểu** giữa hai lần chụp. Trên máy thật `takePictureAsync`
 * cộng bước thu nhỏ ảnh thường tốn 0.6–1.2 giây, tức là vòng chụp chạy hết tốc
 * độ máy cho phép và 12 frame mất khoảng 8–15 giây. Hằng số này chỉ để máy nhanh
 * không chụp dồn quá sát nhau.
 */
export const FRAME_INTERVAL_MS = 350;

/**
 * Chiều rộng chuẩn hoá frame trước khi gửi. Backend cũng thu về 640px trước
 * khi đưa vào FaceMesh, gửi ảnh to hơn chỉ tốn băng thông.
 */
export const FRAME_WIDTH = 640;

/** Ảnh CCCD giữ độ phân giải cao hơn vì OCR cần đọc được chữ nhỏ. */
export const CCCD_WIDTH = 1280;

/** Chất lượng nén JPEG khi chuyển sang base64. */
export const FRAME_QUALITY = 0.6;
export const CCCD_QUALITY = 0.8;

export const CAPTURE_HINT = 'Đặt CCCD trong khung, đủ sáng, không loá và không che góc';
export const LIVENESS_HINT = 'Server yêu cầu ngẫu nhiên mỗi phiên — video quay sẵn không qua được';

/** Nhãn dự phòng khi server không kèm `message`. */
export const RESULT_FALLBACK_MESSAGE: Record<EkycResultCode, string> = {
  VERIFIED: 'Xác minh thành công',
  PROFILE_NO_CCCD: 'Hồ sơ chưa có thông tin CCCD',
  CHALLENGE_EXPIRED: 'Phiên xác minh đã hết hạn',
  OCR_FAILED: 'Không đọc được thông tin trên ảnh CCCD',
  ID_MISMATCH: 'Số CCCD trên ảnh không khớp hồ sơ',
  LIVENESS_FAILED: 'Chưa thực hiện đúng động tác yêu cầu',
  FACE_MISMATCH: 'Khuôn mặt không khớp ảnh trên CCCD',
  RATE_LIMITED: 'Bạn thao tác quá nhanh',
  AI_UNAVAILABLE: 'Dịch vụ xác minh đang bận',
};

/** Cảnh báo trường mềm — hiển thị để người dùng biết cần kiểm tra lại hồ sơ. */
export const WARNING_LABELS: Record<string, string> = {
  FULL_NAME_MISMATCH: 'Họ tên trên ảnh khác hồ sơ',
  DOB_MISMATCH: 'Ngày sinh trên ảnh khác hồ sơ',
};
