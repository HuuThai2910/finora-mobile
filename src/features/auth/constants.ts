/** Tên hiển thị lấy từ cấu hình — mockup dùng tên sản phẩm của bản demo. */
export const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME ?? 'FINORA';

export const APP_TAGLINE = 'Cho vay ngang hàng minh bạch';

/** Khớp `OTP_LENGTH` trong `AuthServiceImpl` của `finora-user`. */
export const OTP_LENGTH = 6;

/**
 * Khớp `MAX_OTP_ATTEMPTS` trong `RateLimitServiceImpl`.
 * Chỉ dùng để viết nhãn cảnh báo; backend mới là bên thực thi giới hạn.
 */
export const OTP_MAX_ATTEMPTS = 5;

/** Khớp `@Size(min = 8)` của `RegisterRequest`/`ResetPasswordRequest`. */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Khoảng chờ trước khi cho bấm gửi lại mã. Backend giới hạn 3 yêu cầu OTP mỗi
 * email mỗi giờ, nên chặn bấm liên tục ở client để người dùng không tự đốt hết
 * hạn mức rồi bị khoá.
 */
export const OTP_RESEND_SECONDS = 60;

/**
 * Nhãn rút gọn để dòng đồng ý nằm gọn một hàng trên màn đăng ký.
 * Tên đầy đủ của tài liệu: "Điều khoản sử dụng" và "Chính sách bảo vệ dữ liệu
 * cá nhân" — hiển thị đủ ở trang tài liệu khi mở.
 */
export const TERMS_LABEL = 'Điều khoản';
export const PRIVACY_LABEL = 'Chính sách bảo mật';
