import { isMocked } from '@/lib/mockFlag';
import * as notificationMock from '@/lib/mocks/notification';
import { HOME_CHAIN_REF, HOME_RECENT } from '@/lib/mocks/fixtures';
import { mockResponse } from '@/lib/mocks/delay';
import { ApiError, notificationFetch } from '@/lib/api';
import type { AppNotification } from '@/types/notification';
import { toAppNotification, type NotificationDto } from './mappers/notificationDto';

const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const listNotifications = async (): Promise<AppNotification[]> => {
  if (isMocked('notification')) return notificationMock.list();
  const rows = await notificationFetch<NotificationDto[]>('/notifications?limit=50');
  return rows.map(toAppNotification);
};

export const getUnreadCount = async (): Promise<number> => {
  if (isMocked('notification')) return notificationMock.unreadCount();
  const result = await notificationFetch<{ count: number }>('/notifications/unread-count');
  return result.count;
};

/**
 * Backend chưa có API "đọc hết": màn Thông báo gọi hàm này cho từng tin chưa đọc
 * (tối đa 50 tin, đúng giới hạn của danh sách).
 */
export const markNotificationRead = async (id: string): Promise<void> => {
  if (isMocked('notification')) return notificationMock.markRead(id);
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
