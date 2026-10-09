export type NotificationKind =
  | 'cashflow'
  | 'disbursement'
  | 'autoinvest'
  | 'reminder'
  | 'chain'
  | 'security'
  | 'credit'
  /** Khoản vay quá hạn hoặc chạm mốc nợ xấu — cần người nhận chú ý hơn tin thường. */
  | 'risk';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  /** Câu tóm tắt in đậm ở đầu thẻ, ví dụ "Đã nhận khoản trả nợ". */
  title: string;
  /** Nội dung chi tiết sau tiêu đề. */
  message: string;
  /**
   * Số tiền đã định dạng ("842.500 đ") để in đậm. Thường xuất hiện nguyên văn trong
   * `message`; không có trong câu thì thẻ đặt nó ở cuối câu.
   */
  highlight?: string;
  unread: boolean;
  occurredAt?: string;
  externalPushRequired?: boolean;
}
