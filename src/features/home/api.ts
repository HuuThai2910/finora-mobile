import { isMocked } from '@/lib/mockFlag';
import * as notificationMock from '@/lib/mocks/notification';
import { HOME_CHAIN_REF, HOME_RECENT } from '@/lib/mocks/fixtures';
import { mockResponse } from '@/lib/mocks/delay';
import { ApiError, notificationFetch } from '@/lib/api';
import type { AppNotification } from '@/types/notification';

type NotificationDto = {
  id: string;
  type: string;
  title: string;
  message: string;
  externalPushRequired: boolean;
  unread: boolean;
  occurredAt: string;
};

const kindOf = (type: string): AppNotification['kind'] => {
  if (type.includes('REPAYMENT') || type.includes('SETTLEMENT')) return 'cashflow';
  if (type.includes('DELINQUENCY') || type.includes('BAD_DEBT')) return 'credit';
  if (type.includes('RESCHEDULED')) return 'reminder';
  return 'credit';
};

const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const listNotifications = async (): Promise<AppNotification[]> => {
  if (isMocked('notification')) return notificationMock.list();
  const rows = await notificationFetch<NotificationDto[]>('/notifications?limit=50');
  return rows.map(row => ({
    id: row.id,
    kind: kindOf(row.type),
    message: `${row.title}. ${row.message}`,
    unread: row.unread,
    occurredAt: row.occurredAt,
    externalPushRequired: row.externalPushRequired,
  }));
};

export const getUnreadCount = async (): Promise<number> => {
  if (isMocked('notification')) return notificationMock.unreadCount();
  const result = await notificationFetch<{ count: number }>('/notifications/unread-count');
  return result.count;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  if (isMocked('notification')) return;
  await notificationFetch<void>(`/notifications/${id}/read`, { method: 'POST' });
};

export type HomeSummary = {
  recent: typeof HOME_RECENT;
  chainRef: typeof HOME_CHAIN_REF;
};

/**
 * Hoạt động ví và blockchain trên trang chủ vẫn là dữ liệu demo của các service chưa hoàn thành.
 * Hồ sơ vay không nằm ở đây vì đã được đọc riêng từ API thật của finora-loan.
 */
export const getHomeSummary = (): Promise<HomeSummary> =>
  isMocked('home')
    ? mockResponse('home', {
        recent: HOME_RECENT,
        chainRef: HOME_CHAIN_REF,
      })
    : notImplemented('Tóm tắt trang chủ');
