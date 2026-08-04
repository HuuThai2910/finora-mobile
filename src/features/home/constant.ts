import type { NotificationKind } from '@/types/notification';
import type { IconName } from '@/constants/icons';

/**
 * Mockup dùng emoji mở đầu mỗi dòng thông báo. Ở đây thay bằng icon vector cùng
 * bộ Lucide để giữ một ngôn ngữ hình ảnh thống nhất và hiển thị đồng nhất trên
 * mọi thiết bị.
 */
export const NOTIFICATION_ICON: Record<NotificationKind, IconName> = {
  cashflow: 'coins',
  disbursement: 'check',
  autoinvest: 'zap',
  reminder: 'clock',
  chain: 'chain',
  security: 'shield',
  credit: 'chart',
};

export const NOTIFICATION_LABEL: Record<NotificationKind, string> = {
  cashflow: 'Dòng tiền',
  disbursement: 'Giải ngân',
  autoinvest: 'Auto-Invest',
  reminder: 'Nhắc lịch',
  chain: 'Sổ cái',
  security: 'Bảo mật',
  credit: 'Tín dụng',
};
