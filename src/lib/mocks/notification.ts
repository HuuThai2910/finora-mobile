import { mockResponse } from './delay';
import { NOTIFICATIONS } from './fixtures';
import type { AppNotification } from '@/types/notification';

export const list = (): Promise<AppNotification[]> => mockResponse('notification', NOTIFICATIONS);

export const unreadCount = (): Promise<number> =>
  mockResponse('notification', NOTIFICATIONS.filter(n => n.unread).length);
