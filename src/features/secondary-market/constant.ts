import type { ImageSourcePropType } from 'react-native';
import type { BookOrderStatus, CancelReason, OrderSide } from '@/types/orderBook';

/**
 * Mức phí chuyển nhượng, chỉ để **hiển thị** số tạm tính cho người bán. Con số chính thức do backend
 * chốt lúc khớp (policy demo INV-E1, không phải quy định pháp luật).
 */
export const FEE_RATE_PERCENT = 5;

/** Bước giá và khoảng giá backend chấp nhận (% dư nợ gốc còn lại). */
export const PRICE_STEP = 0.1;
export const PRICE_MIN = 0.1;
export const PRICE_MAX = 100;
export const QUANTITY_MAX = 10_000;

/** Trên web và máy tính bảng, giữ cột nội dung cỡ điện thoại như các màn đã vẽ lại. */
export const BOOK_MAX_WIDTH = 480;
export const BOOK_PADDING = 16;

/** Số mức giá mỗi phía hiện trên thang giá; backend gửi tối đa 20. */
export const LADDER_DEPTH = 5;

/** Khi không mở được luồng đẩy (mock, mạng chặn) thì hỏi lại sổ theo nhịp này. */
export const POLL_INTERVAL_MS = 5_000;
/** Luồng đứt thì chờ chừng này rồi mở lại, trong lúc đó vẫn hỏi định kỳ. */
export const STREAM_RETRY_MS = 15_000;

export const SIDE_LABEL: Record<OrderSide, string> = { BID: 'Mua', ASK: 'Bán' };

export const STATUS_LABEL: Record<BookOrderStatus, string> = {
  PENDING_FUNDS: 'Đang giữ tiền',
  OPEN: 'Đang chờ khớp',
  PARTIALLY_FILLED: 'Khớp một phần',
  FILLED: 'Đã khớp hết',
  CANCELLED: 'Đã huỷ',
  REJECTED: 'Bị từ chối',
  UNKNOWN: 'Đang cập nhật',
};

export const STATUS_TONE: Record<BookOrderStatus, 'blue' | 'green' | 'amber' | 'gray' | 'red'> = {
  PENDING_FUNDS: 'amber',
  OPEN: 'blue',
  PARTIALLY_FILLED: 'blue',
  FILLED: 'green',
  CANCELLED: 'gray',
  REJECTED: 'red',
  UNKNOWN: 'gray',
};

export const CANCEL_REASON_LABEL: Record<CancelReason, string> = {
  USER: 'Bạn đã huỷ phần chưa khớp.',
  SELF_TRADE_PREVENTED: 'Lệnh chạm vào lệnh của chính bạn nên phần còn lại bị huỷ.',
  NOTE_UNAVAILABLE: 'Note trong lệnh không còn giao được nên phần còn lại bị huỷ.',
  UNKNOWN: 'Phần chưa khớp đã bị huỷ.',
};

export const MARKET_INTRO =
  'Mua lại Note của nhà đầu tư khác, hoặc bán Note đang giữ để lấy tiền trước hạn. Lệnh khớp ngay khi giá mua chạm giá bán.';

export const MARKET_NOTE =
  `Giá tính theo % dư nợ gốc còn lại của mỗi Note, tối đa 100%. Nền tảng thu ${FEE_RATE_PERCENT}% trên tiền bán, trừ vào tiền người bán nhận.`;

export const BUY_NOTE =
  'Tiền mua được giữ tạm trong ví ngay khi đặt lệnh. Khớp ở giá thấp hơn thì phần giữ thừa trả lại ví khi lệnh xong.';

export const SELL_NOTE =
  `Note trong lệnh bán vẫn là của bạn và vẫn nhận gốc lãi cho tới khi khớp. Bạn nhận tiền sau khi trừ phí ${FEE_RATE_PERCENT}%.`;

/**
 * Mốc hình minh hoạ trong `wallet-background.png` (pixel ảnh gốc, đo bằng PIL) — cùng số đo màn
 * "Lịch sử ví" dùng; chép lại ở đây vì feature không đọc hằng số nội bộ của feature khác.
 */
export const NOTES_ART = {
  /** Chân hai linh vật: thẻ đầu tiên bắt đầu từ đây. */
  bottom: 300,
} as const;

/** Robot cầm đồng xu (toàn thân, 480×510) — mascot thẻ giá của sổ lệnh, như mockup 02/10. */
export const BOOK_MASCOT: ImageSourcePropType = require('@/assets/mascot-coin.png');

/** Robot nửa người cầm đồng xu (480×459, nền trong) — góc thẻ "Tạm tính" của form đặt lệnh. */
export const ESTIMATE_MASCOT: ImageSourcePropType = require('@/assets/mascot-coin-bust.png');

/** Robot cầm đồng xu (toàn thân) — chào khi đặt lệnh xong. */
export const ORDER_DONE_MASCOT: ImageSourcePropType = require('@/assets/mascot-coin.png');

/**
 * Mốc hình minh hoạ trong `contracts-background.png` (nền "Lệnh của tôi") — cùng số đo màn "Hợp
 * đồng của tôi"; chép lại vì feature không đọc hằng số nội bộ của feature khác.
 */
export const MY_ORDERS_ART = {
  /** Mép dưới cụm linh vật + chậu lá: hàng chip lọc bắt đầu từ đây. */
  bottom: 299,
} as const;
