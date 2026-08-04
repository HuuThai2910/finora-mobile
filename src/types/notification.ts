export type NotificationKind =
  | 'cashflow'
  | 'disbursement'
  | 'autoinvest'
  | 'reminder'
  | 'chain'
  | 'security'
  | 'credit';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  /** Nội dung hiển thị; phần in đậm được tách ra `highlight`. */
  message: string;
  highlight?: string;
  unread: boolean;
}
