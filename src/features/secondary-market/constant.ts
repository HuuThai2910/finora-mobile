import type { NoteListingStatus } from '@/types/invest';

/** Nhãn trạng thái tin đăng bán. */
export const STATUS_LABEL: Record<NoteListingStatus, string> = {
  OPEN: 'Đang bán',
  SOLD: 'Đã bán',
  CANCELLED: 'Đã rút',
};

/** Tông màu tag, dùng lại bộ màu của các màn đầu tư khác. */
export const STATUS_TONE: Record<NoteListingStatus, 'green' | 'blue' | 'gray'> = {
  OPEN: 'blue',
  SOLD: 'green',
  CANCELLED: 'gray',
};

/**
 * Mức phí chuyển nhượng, chỉ để **hiển thị** cho người bán biết trước.
 *
 * Con số chính thức do backend chốt tại thời điểm giao dịch và trả về trong `platformFee`;
 * màn hình không dùng con số tự tính để hạch toán.
 */
export const FEE_RATE_PERCENT = 5;

export const SECONDARY_INTRO =
  'Bán Note đang giữ để lấy tiền trước hạn. Giá bán không được vượt dư nợ gốc còn lại, '
  + `nền tảng thu ${FEE_RATE_PERCENT}% trên giá bán và trừ vào tiền bạn nhận.`;

export const BUYER_INTRO =
  'Mua lại Note của nhà đầu tư khác. Bạn trả đúng giá treo và nhận toàn bộ gốc lãi còn lại '
  + 'của Note đó.';

/** Cảnh báo bắt buộc trước khi xác nhận mua một Note thuộc khoản vay đang nợ xấu. */
export const DEFAULTED_BUY_WARNING =
  'Khoản vay gốc của Note này đang trong tình trạng nợ xấu. Khả năng thu hồi gốc và lãi thấp '
  + 'hơn Note bình thường. Cân nhắc kỹ trước khi mua.';

/** Cảnh báo khi người bán treo một Note đang nợ xấu. */
export const DEFAULTED_SELL_WARNING =
  'Note này thuộc khoản vay đang nợ xấu. Người mua sẽ thấy cảnh báo này, nên giá bán thường '
  + 'phải thấp hơn dư nợ gốc khá nhiều mới có người mua.';
