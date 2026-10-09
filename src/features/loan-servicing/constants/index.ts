/**
 * Khung chung của các màn khoản vay đang trả, cùng số đo với "Hợp đồng của tôi" và
 * "Chi tiết hợp đồng": cột tối đa 480pt trên web/máy tính bảng, lề hai bên 16pt.
 */
export const SERVICING_MAX_WIDTH = 480;
export const SERVICING_PADDING = 16;

/** Đáy chừa một dải để lớp sóng đáy của nền lộ ra dưới thẻ cuối. */
export const SERVICING_BOTTOM_SPACE = 56;

/** Lý do đề nghị cơ cấu tối đa 500 ký tự, khớp `@Size(max = 500)` của Loan Service. */
export const RESCHEDULE_REASON_MAX = 500;

/** Số kỳ gia hạn hợp lệ, khớp `@Positive @Max(120)` của Loan Service. */
export const RESCHEDULE_EXTRA_TERMS_MIN = 1;
export const RESCHEDULE_EXTRA_TERMS_MAX = 120;

/** Số ngày đến hạn gợi ý sẵn ở ô "Áp dụng từ kỳ". */
export const RESCHEDULE_DATE_SUGGESTIONS = 3;
