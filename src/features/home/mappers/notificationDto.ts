import type { AppNotification, NotificationKind } from '@/types/notification';
import { formatDong } from '@/utils/format';

/** Một dòng của `GET /notifications` (finora-notification, thông báo trong app). */
export type NotificationDto = {
  id: string;
  /** Mã mẫu thông báo, ví dụ `REPAYMENT_CREDITED` (nhà đầu tư) hoặc `LOAN_DISBURSED` (người vay). */
  type: string;
  /** Nhóm thông báo (R7): FUNDING, CONTRACT, DISBURSEMENT, REPAYMENT, DELINQUENCY, RESTRUCTURING, WALLET, GENERAL. */
  category?: string;
  title: string;
  message: string;
  externalPushRequired: boolean;
  unread: boolean;
  occurredAt: string;
};

/**
 * Loại riêng cho các mã mà nhóm của nó không tả đúng sắc thái: tin tốt trong nhóm quá hạn, lời nhắc lịch.
 * Gồm các `changeType` finora-investment phát ra (`RepaymentDistributedEventHandler`,
 * `LoanServicingLifecycleEventHandler`).
 */
const KIND_BY_TYPE: Readonly<Record<string, NotificationKind>> = {
  REPAYMENT_CREDITED: 'cashflow',
  EARLY_SETTLEMENT: 'cashflow',
  SETTLED: 'cashflow',
  RESCHEDULED: 'reminder',
  DELINQUENCY_CURED: 'credit',
  DELINQUENCY_CHANGED: 'risk',
  BAD_DEBT_MILESTONE: 'risk',
  OVERDUE_CURED: 'credit',
  INSTALLMENT_DUE_SOON: 'reminder',
  INSTALLMENT_DUE_TODAY: 'reminder',
};

/**
 * Loại theo nhóm cho các mã mới của R7. Nhóm hay mã lạ rơi về `credit` — nhóm trung tính, không tô đỏ khi không biết
 * chắc đó là tin xấu.
 */
const KIND_BY_CATEGORY: Readonly<Record<string, NotificationKind>> = {
  FUNDING: 'credit',
  CONTRACT: 'reminder',
  DISBURSEMENT: 'disbursement',
  REPAYMENT: 'cashflow',
  DELINQUENCY: 'risk',
  RESTRUCTURING: 'reminder',
  WALLET: 'cashflow',
  GENERAL: 'credit',
};

/**
 * Backend ghép thẳng `BigDecimal` vào câu ("vừa phân bổ 842500.00 VND vào…").
 * Đổi tại chỗ sang cách app viết tiền ("842.500 đ") và ghi lại số đầu tiên để thẻ in đậm;
 * phần chữ còn lại giữ nguyên của backend. Câu có hai số tiền (đã trả và kỳ tiếp theo) đổi cả hai.
 */
const RAW_AMOUNT = /(\d+(?:\.\d+)?)\s*VND/g;

function formatAmount(message: string): Pick<AppNotification, 'message' | 'highlight'> {
  let highlight: string | undefined;
  const formattedMessage = message.replace(RAW_AMOUNT, (raw: string, digits: string) => {
    const amount = Number(digits);
    if (Number.isNaN(amount)) return raw;
    const formatted = formatDong(amount);
    highlight ??= formatted;
    return formatted;
  });
  return highlight ? { message: formattedMessage, highlight } : { message };
}

export function toAppNotification(dto: NotificationDto): AppNotification {
  return {
    id: dto.id,
    kind: KIND_BY_TYPE[dto.type] ?? (dto.category ? KIND_BY_CATEGORY[dto.category] : undefined) ?? 'credit',
    title: dto.title,
    ...formatAmount(dto.message),
    unread: dto.unread,
    occurredAt: dto.occurredAt,
    externalPushRequired: dto.externalPushRequired,
  };
}
