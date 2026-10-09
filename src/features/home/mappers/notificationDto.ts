import type { AppNotification, NotificationKind } from '@/types/notification';
import { formatDong } from '@/utils/format';

/** Một dòng của `GET /notifications` (finora-notification, thông báo trong app). */
export type NotificationDto = {
  id: string;
  /** Loại thay đổi do finora-investment phát cho nhà đầu tư, ví dụ `REPAYMENT_CREDITED`. */
  type: string;
  title: string;
  message: string;
  externalPushRequired: boolean;
  unread: boolean;
  occurredAt: string;
};

/**
 * Bảng loại theo đúng các `changeType` mà finora-investment phát ra
 * (`RepaymentDistributedEventHandler`, `LoanServicingLifecycleEventHandler`).
 * Loại lạ chưa có trong bảng rơi về `credit` — nhóm trung tính, không tô đỏ khi
 * không biết chắc đó là tin xấu.
 */
const KIND_BY_TYPE: Readonly<Record<string, NotificationKind>> = {
  REPAYMENT_CREDITED: 'cashflow',
  EARLY_SETTLEMENT: 'cashflow',
  SETTLED: 'cashflow',
  RESCHEDULED: 'reminder',
  DELINQUENCY_CURED: 'credit',
  DELINQUENCY_CHANGED: 'risk',
  BAD_DEBT_MILESTONE: 'risk',
};

/**
 * Backend ghép thẳng `BigDecimal` vào câu ("vừa phân bổ 842500.00 VND vào…").
 * Đổi tại chỗ sang cách app viết tiền ("842.500 đ") và ghi lại để thẻ in đậm số đó;
 * phần chữ còn lại giữ nguyên của backend.
 */
const RAW_AMOUNT = /(\d+(?:\.\d+)?)\s*VND/;

function formatAmount(message: string): Pick<AppNotification, 'message' | 'highlight'> {
  const match = RAW_AMOUNT.exec(message);
  const amount = match ? Number(match[1]) : Number.NaN;
  if (!match || Number.isNaN(amount)) return { message };
  const formatted = formatDong(amount);
  return { message: message.replace(RAW_AMOUNT, formatted), highlight: formatted };
}

export function toAppNotification(dto: NotificationDto): AppNotification {
  return {
    id: dto.id,
    kind: KIND_BY_TYPE[dto.type] ?? 'credit',
    title: dto.title,
    ...formatAmount(dto.message),
    unread: dto.unread,
    occurredAt: dto.occurredAt,
    externalPushRequired: dto.externalPushRequired,
  };
}
