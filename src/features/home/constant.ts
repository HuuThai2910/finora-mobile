import type { ImageSourcePropType } from 'react-native';
import type { NotificationKind } from '@/types/notification';
import type { IconName } from '@/constants/icons';

/**
 * Hình đứng trước tên nhóm ở đầu thẻ thông báo. Mỗi hình vẽ đúng việc đã xảy ra
 * với tiền hoặc khoản vay, không dùng hình chung chung (dấu tích, tia chớp cho mọi
 * thứ): nhìn hình là đoán được tin trước khi đọc chữ.
 */
export const NOTIFICATION_ICON: Record<NotificationKind, IconName> = {
  /** Tiền trả nợ đã về các Note, khoản vay tất toán. */
  cashflow: 'handCoins',
  /** Vốn đã chuyển cho người vay. */
  disbursement: 'banknoteArrowUp',
  /** Auto-Invest tự rót vốn theo tiêu chí. */
  autoinvest: 'zap',
  /** Lịch trả nợ được cơ cấu, kỳ sắp đến hạn. */
  reminder: 'calendarClock',
  /** Mã băm hợp đồng đã ghi lên sổ cái để đối chiếu. */
  chain: 'fileCheck',
  /** Đăng nhập lạ, thay đổi bảo mật tài khoản. */
  security: 'shieldAlert',
  /** Điểm tín dụng thay đổi, khoản vay hết quá hạn. */
  credit: 'gauge',
  /** Khoản vay đang quá hạn hoặc chạm mốc nợ xấu. */
  risk: 'clockAlert',
};

/** Tên nhóm ở đầu mỗi thẻ thông báo, ngay sau hình của nhóm. */
export const NOTIFICATION_LABEL: Record<NotificationKind, string> = {
  cashflow: 'Dòng tiền',
  disbursement: 'Giải ngân',
  autoinvest: 'Auto-Invest',
  reminder: 'Lịch trả nợ',
  chain: 'Sổ cái',
  security: 'Bảo mật',
  credit: 'Tín dụng',
  risk: 'Rủi ro',
};

/**
 * Mức chú ý của từng nhóm tin, quyết định màu hình đầu thẻ: `money` xanh lá (kèm số
 * tiền xanh lá trong câu), `info` xanh của app, `danger` đỏ cả hình lẫn tên nhóm.
 * Mọi tin cảnh báo (lịch trả nợ đổi, quá hạn, đăng nhập lạ) dùng chung một màu đỏ —
 * Hải không muốn thêm bậc cam ở giữa. Chữ tên nhóm luôn đi kèm nên màu không phải tín
 * hiệu duy nhất.
 */
export type NotificationTone = 'money' | 'info' | 'danger';

export const NOTIFICATION_TONE: Record<NotificationKind, NotificationTone> = {
  cashflow: 'money',
  disbursement: 'info',
  autoinvest: 'info',
  reminder: 'danger',
  chain: 'info',
  security: 'danger',
  credit: 'info',
  risk: 'danger',
};

/* ---------------- Màn "Thông báo" (09/10/2026) ---------------- */

/** Trên web và máy tính bảng, giữ cột nội dung cỡ điện thoại như các màn danh sách khác. */
export const NOTIFICATIONS_MAX_WIDTH = 480;

/** Lề hai bên, cùng bộ màn "Lịch sử ví" và "Hợp đồng của tôi". */
export const NOTIFICATIONS_PADDING = 16;

/**
 * Các mốc của hình minh hoạ trong `notifications-background.png` (pixel ảnh gốc,
 * đo bằng PIL). Ảnh đặt sát mép trên màn, không lùi theo vùng an toàn.
 */
export const NOTIFICATIONS_ART = {
  /** Đỉnh ăng-ten robot: hàng tiêu đề nằm trọn phía trên mốc này. */
  top: 277,
  /** Chân robot, hộp quà và chồng xu: danh sách thông báo bắt đầu từ đây. */
  bottom: 488,
  /** Mép trái cụm lá + nhãn % cạnh robot: dòng phụ dưới tiêu đề không vượt quá mốc này. */
  left: 434,
} as const;

/** Mascot robot cầm đồng xu trên thẻ ví (ảnh Hải tạo, đã cắt sát hình). */
export const WALLET_MASCOT: ImageSourcePropType = require('@/assets/mascot-coin.png');

/** Nơi mỗi thẻ giới thiệu dẫn tới; màn chính tự đổi sang lệnh điều hướng. */
export type PromoTarget = 'products' | 'topUp' | 'payInstallment';

export type PromoSlide = {
  target: PromoTarget;
  /** Có dấu cách không ngắt ( ) để cụm từ như "tài chính" không bị tách hai dòng. */
  title: string;
  /** Icon Lucide làm hình minh hoạ, thay cho hình 3D trong mockup. */
  icon: IconName;
  /** Điều xảy ra khi bấm, đọc cho trình đọc màn hình. */
  hint: string;
};

/**
 * Ba thẻ giới thiệu chạy ngang cạnh lời chào (mockup vẽ ba chấm trang). Thẻ đầu
 * lấy nguyên câu của mockup; hai thẻ sau dẫn tới các việc người vay hay làm nhất
 * trên app. Mỗi thẻ mở đúng một màn có sẵn, không có nội dung khuyến mãi giả.
 */
export const PROMO_SLIDES: readonly PromoSlide[] = [
  {
    target: 'products',
    title: 'Vay nhanh, chủ động tài chính',
    icon: 'clipboardCheck',
    hint: 'Mở danh sách sản phẩm vay',
  },
  {
    target: 'topUp',
    title: 'Nạp ví nhanh qua VietQR',
    icon: 'qrCode',
    hint: 'Mở màn nạp tiền vào ví',
  },
  {
    target: 'payInstallment',
    title: 'Trả nợ từ ví chỉ vài chạm',
    icon: 'calendarCheck',
    hint: 'Mở màn trả nợ kỳ này',
  },
];
