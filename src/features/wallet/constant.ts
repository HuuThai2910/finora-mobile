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

/* ---------------- Rút tiền về ngân hàng (R4, W3B — 17/10/2026) ---------------- */

/**
 * Mức chọn nhanh dưới ô số tiền rút. Chỉ hiện mức nằm trong giới hạn rút được lúc này (tối thiểu, hạn mức
 * còn lại hôm nay, số dư khả dụng); giới hạn đó lấy từ policy của Payment, app không tự đặt.
 */
export const WITHDRAW_QUICK_AMOUNTS = [100_000, 500_000, 1_000_000, 5_000_000] as const;

/** Mỗi trang lịch sử rút tiền (backend cho tối đa 100). */
export const WITHDRAWAL_PAGE_SIZE = 20;

/** Provider giả lập gửi kết quả sau vài giây: hỏi lại mỗi 3 giây là thấy sớm mà không dồn request. */
export const WITHDRAWAL_POLL_INTERVAL_MS = 3_000;

/**
 * Khung tự theo dõi một lệnh kể từ lúc mở màn (hoặc bấm kiểm tra lại). Lệnh rơi vào đối soát có thể mất lâu
 * hơn nhiều; quá khung thì dừng tự hỏi và chờ người dùng bấm "Kiểm tra lại", không hỏi vô hạn.
 */
export const WITHDRAWAL_POLL_WINDOW_MS = 2 * 60_000;

/** Hiện khi Payment báo provider chi tiền là bản giả lập (`simulatedProvider`). */
export const WITHDRAW_DEMO_NOTE =
  'Môi trường demo: tiền trong ví là tiền giả lập và lệnh rút do nhà cung cấp giả lập xử lý, không có tiền thật chuyển tới ngân hàng. Số tài khoản kết thúc bằng 0000 mô phỏng tài khoản không hợp lệ để thử trường hợp hoàn tiền.';

export const WITHDRAW_DEMO_SHORT_NOTE =
  'Môi trường demo: lệnh rút do nhà cung cấp giả lập xử lý, không có tiền thật chuyển tới ngân hàng.';

export const WITHDRAW_FORM_NOTE =
  'Tiền được trừ khỏi ví ngay khi lệnh được nhận. Nếu lệnh chi không thành công, toàn bộ số tiền được hoàn lại ví.';
