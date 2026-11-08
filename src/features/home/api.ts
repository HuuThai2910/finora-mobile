import { isMocked } from '@/lib/mockFlag';
import * as notificationMock from '@/lib/mocks/notification';
import { notificationFetch } from '@/lib/api';
import type { AppNotification } from '@/types/notification';
import { toAppNotification, type NotificationDto } from './mappers/notificationDto';

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
