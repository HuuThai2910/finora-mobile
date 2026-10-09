export const AML_NOTE =
  'Chỉ rút về tài khoản ngân hàng chính chủ đã xác minh — quy tắc chống rửa tiền (AML)';

export const TOPUP_NOTE =
  'Webhook từ payment gateway tự cộng ví sau ~5 giây · đối soát tự động cuối ngày';

export const RECONCILE_NOTE =
  'Mọi giao dịch đều qua tài khoản đối soát — đối soát batch 00:15 hằng ngày';

export const PAYMENT_NOTE =
  'Tự động phân bổ gốc/lãi về 12 nhà đầu tư · ghi RepaymentSettled lên Fabric';

/* ---------------- Màn "Lịch sử ví" (mockup 26/09/2026) ---------------- */

/** Trên web và máy tính bảng, giữ cột nội dung cỡ điện thoại thay vì giãn theo cửa sổ. */
export const WALLET_HISTORY_MAX_WIDTH = 480;

/** Lề hai bên của bộ mockup mới (cùng màn "Hợp đồng của tôi"). */
export const WALLET_HISTORY_PADDING = 16;

/**
 * Các mốc của hình minh hoạ trong `wallet-background.png` (pixel ảnh gốc, đo
 * bằng PIL). Ảnh đặt sát mép trên màn như mockup, không lùi theo vùng an toàn.
 */
export const WALLET_HISTORY_ART = {
  /** Đỉnh đầu linh vật xanh: hàng tiêu đề nằm trọn phía trên mốc này thì không cần né hình. */
  top: 148,
  /** Chân hai linh vật + chậu lá: thẻ tài khoản bắt đầu từ đây. */
  bottom: 300,
  /** Mép trái chậu lá bên trái (hàng 188–285), vật gần nhất ngang hàng tiêu đề. */
  titleLimit: 410,
} as const;

/* ---------------- Màn "Nạp tiền vào ví" (10/10/2026) ---------------- */

/**
 * Giới hạn một lần nạp, khớp mặc định `payment.top-up.minimum-amount/maximum-amount` của
 * Payment Service. Kiểm tra ở app chỉ để báo sớm; backend vẫn là nơi quyết định.
 */
export const TOPUP_MIN = 10_000;
export const TOPUP_MAX = 100_000_000;

/** Mức chọn nhanh dưới ô số tiền: ba hàng nhỏ cho lần nạp thử, ba hàng lớn cho nhà đầu tư. */
export const TOPUP_QUICK_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000] as const;

/** Số tiền điền sẵn khi mở màn, giữ như bản trước. */
export const TOPUP_DEFAULT_AMOUNT = 1_000_000;

export const TOPUP_FORM_NOTE =
  'Bản demo nạp qua ZaloPay sandbox hoặc chế độ giả lập, không phát sinh tiền thật. Số dư chỉ được cộng khi cổng thanh toán xác nhận đã nhận tiền.';

export const TOPUP_PAYMENT_NOTE =
  'Số dư chỉ được cộng khi cổng thanh toán gửi xác nhận hợp lệ, hoặc khi bấm giả lập ở bản demo.';
