import type { ImageSourcePropType } from 'react-native';

export const CONTRACT_NOTE =
  'Mọi nhà đầu tư và người vay ký trên cùng một bản PDF. Khoản vay chỉ giải ngân khi đủ chữ ký của tất cả các bên.';

/** Hai phương thức ký số VNPT SmartCA trong mockup. */
export const SIGNATURE_METHODS = [
  { value: 'PASSWORD_OTP' as const, label: 'Mật khẩu + OTP' },
  { value: 'APP_CONFIRM' as const, label: 'Xác nhận trên App' },
];

/** Robot cầm đồng xu — mascot thẻ tổng quan danh mục, cùng nhân vật thẻ ví ở trang chủ. */
export const PORTFOLIO_MASCOT: ImageSourcePropType = require('@/assets/mascot-coin.png');

/** Trên web và máy tính bảng, giữ cột nội dung cỡ điện thoại như các màn đã vẽ lại. */
export const PORTFOLIO_MAX_WIDTH = 480;
export const PORTFOLIO_PADDING = 16;

export const PENDING_NOTE =
  'đang chờ gọi đủ vốn, ký hợp đồng hoặc giải ngân. Nếu khoản vay dừng, tiền sẽ trở lại ví.';

/**
 * Mốc hình minh hoạ trong `contracts-background.png` (nền màn ký hợp đồng) — cùng số đo màn "Hợp đồng
 * của tôi": mép dưới cụm linh vật cầm hợp đồng.
 */
export const CONTRACT_ART_BOTTOM = 299;
