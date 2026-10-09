import { mockResponse } from './delay';
import { NOTIFICATIONS } from './fixtures';
import type { AppNotification } from '@/types/notification';

/**
 * Tin đã đánh dấu đọc trong phiên chạy app. Giữ ở bộ nhớ để lúc demo bấm "đọc" thì
 * chấm đỏ mất thật và số trên chuông trang chủ giảm theo; mở lại app thì về như cũ.
 */
const readIds = new Set<string>();

const current = (): AppNotification[] =>
  NOTIFICATIONS.map(n => (readIds.has(n.id) ? { ...n, unread: false } : n));

export const list = (): Promise<AppNotification[]> => mockResponse('notification', current());

export const unreadCount = (): Promise<number> =>
  mockResponse('notification', current().filter(n => n.unread).length);

export const markRead = async (id: string): Promise<void> => {
  // Đi qua `mockResponse` trước để `EXPO_PUBLIC_MOCK_FAIL=notification` làm lỗi được cả thao tác này.
  await mockResponse('notification', null);
  readIds.add(id);
};
