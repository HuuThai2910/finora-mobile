import type { ImageSourcePropType } from 'react-native';
export const AUTO_INVEST_ON_NOTE = 'Hệ thống tự đặt lệnh góp vốn khi có khoản vay mới khớp tiêu chí của bạn.';
export const AUTO_INVEST_OFF_NOTE = 'Bạn tự chọn từng khoản vay trên Sàn. Bật lên để hệ thống tự góp vốn theo tiêu chí.';

export const AUTO_INVEST_FOOTNOTE =
  'Lệnh tự động giữ tiền trong ví như lệnh bạn tự đặt. Ai bật trước được xét trước khi khoản vay mới lên sàn. Khi khoản vay đủ vốn, bạn vẫn cần tự ký hợp đồng.';

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
  'đang chờ giải ngân. Note được phát hành và bắt đầu sinh lãi khi khoản vay giải ngân xong.';

/**
 * Banner màn Auto-Invest: ba robot làm việc trên sàn (cùng ảnh `market-hero.png` của màn Sàn, 2172×724)
 * — đúng hình ảnh "robot tự góp vốn thay bạn". Mốc đo bằng PIL, chép từ màn Sàn vì feature không đọc
 * hằng số nội bộ của feature khác: ảnh canh phải, phần từ cột `cropLeft` tới mép phải vừa bề rộng cột.
 */
export const AUTO_INVEST_HERO = {
  source: require('@/assets/market-hero.png') as ImageSourcePropType,
  width: 2172,
  height: 724,
  cropLeft: 700,
  /** Chân robot: thẻ đầu tiên bắt đầu ngay dưới mốc này. */
  groundRow: 614,
} as const;

/**
 * Mốc hình minh hoạ trong `contracts-background.png` (nền màn ký hợp đồng) — cùng số đo màn "Hợp đồng
 * của tôi": mép dưới cụm linh vật cầm hợp đồng.
 */
export const CONTRACT_ART_BOTTOM = 299;
