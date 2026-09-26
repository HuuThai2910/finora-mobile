import type { ImageSourcePropType } from 'react-native';

/**
 * Nhãn tiếng Việt cho enum `repaymentMethod` của backend — mockup hiển thị ở
 * cột "Kiểu tính lãi".
 */
export const REPAYMENT_METHOD_LABEL: Record<string, string> = {
  ANNUITY: 'Trả góp đều',
  EQUAL_PRINCIPAL: 'Dư nợ giảm dần',
};

/** Ngày giải ngân dự kiến mặc định khi tính thử lịch trả nợ: 30 ngày tới. */
export const defaultDisbursementDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

/**
 * Sinh danh sách kỳ hạn cho nhóm chip chọn — mockup hiển thị 6 mốc
 * (6/12/18/24/30/36) nằm trong khoảng cho phép của sản phẩm.
 */
export function termOptions(min: number, max: number): { value: number; label: string }[] {
  const candidates = [6, 12, 18, 24, 30, 36, 48];
  const inRange = candidates.filter(t => t >= min && t <= max);
  const list = inRange.length ? inRange : [min, max];
  return list.map(t => ({ value: t, label: `${t} tháng` }));
}

export const SCHEDULE_TAIL_NOTE = (remaining: number, method: string) =>
  `… ${remaining} kỳ tiếp theo · ${method.toLowerCase()}`;

/* ---------------- Màn "Sản phẩm vay" (mockup 26/09/2026) ---------------- */

/**
 * Trên web và máy tính bảng, cột nội dung dừng ở bề rộng này và nằm giữa như
 * nhóm màn tài khoản, để thẻ và hình minh hoạ không phình theo cửa sổ.
 */
export const PRODUCT_LIST_MAX_WIDTH = 480;

/** Bề rộng màn mà mockup được vẽ; phần đầu trang co giãn theo tỉ lệ này. */
export const PRODUCT_LIST_DESIGN_WIDTH = 393;

/** Khoảng cách giữa hai thẻ sản phẩm (cả thẻ giả lúc đang tải), đo từ mockup. */
export const PRODUCT_CARD_GAP = 14;

/**
 * Ô biểu tượng ở đầu thẻ và ở đầu mỗi dòng thông số. Thẻ giả lúc đang tải dùng
 * cùng số đo để khi dữ liệu về bố cục không nhảy.
 */
export const PRODUCT_CARD_TILE = { size: 44, radius: 12 } as const;
export const PRODUCT_ROW_TILE = { size: 30, radius: 9 } as const;

/** Ảnh nền sóng (857×1836) — vẽ sẵn theo tỉ lệ màn điện thoại. */
export const PRODUCT_LIST_BACKGROUND: ImageSourcePropType = require('@/assets/products-background.png');

/** Robot cầm đồng xu ở đầu trang; kích thước điểm ảnh để dựng đúng tỉ lệ. */
export const PRODUCT_LIST_MASCOT: { source: ImageSourcePropType; width: number; height: number } = {
  source: require('@/assets/mascot-coin-bust.png'),
  width: 480,
  height: 459,
};

/* ------------- Luồng nhập khoản vay ba bước (mockup 26/09/2026) ------------- */

/**
 * Cột nội dung của cả ba bước dừng cùng bề rộng với màn "Sản phẩm vay", để trên
 * web đi từ danh sách vào các bước thì cột không đổi cỡ.
 */
export const LOAN_STEP_MAX_WIDTH = PRODUCT_LIST_MAX_WIDTH;

/** Bề rộng màn mà mockup các bước được vẽ (ảnh 870px ≈ 393pt × 2,21). */
export const LOAN_STEP_DESIGN_WIDTH = 393;

/** Ảnh nền sóng (870×1808) vẽ theo tỉ lệ màn điện thoại, dùng chung cho các bước. */
export const LOAN_STEP_BACKGROUND: ImageSourcePropType = require('@/assets/loan-step-background.png');

/**
 * Thẻ + khiên + lá (đã cắt sát vùng có hình, 600×315 điểm ảnh). Ảnh gốc cắt thẳng
 * ở đáy vì được vẽ để nấp sau một thẻ trắng, nên nơi dùng phải cho thẻ đè lên đáy.
 */
export const LOAN_STEP_ILLUSTRATION: { source: ImageSourcePropType; width: number; height: number } = {
  source: require('@/assets/loan-card-shield.png'),
  width: 600,
  height: 315,
};

/** Lề ngang của các bước, đo từ mockup (thẻ và ô nhập cách mép màn 24pt). */
export const LOAN_STEP_GUTTER = 24;

/**
 * Nhịp của nút +/− ở ô số tiền. Chỉ để chọn cho nhanh: backend chỉ kiểm tra số
 * tiền nằm trong [minAmount, maxAmount], nên người vay vẫn gõ được số lẻ.
 */
export const LOAN_AMOUNT_STEP = 1_000_000;

/** Số tiền điền sẵn khi mở một Product (kẹp vào biên của Product), giữ như màn cũ. */
export const DEFAULT_LOAN_AMOUNT = 50_000_000;
