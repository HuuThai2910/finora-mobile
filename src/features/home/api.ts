import { isMocked } from '@/lib/mockFlag';
import * as notificationMock from '@/lib/mocks/notification';
import { HOME_CHAIN_REF, HOME_RECENT } from '@/lib/mocks/fixtures';
import { mockResponse } from '@/lib/mocks/delay';
import { ApiError } from '@/lib/api';
import type { AppNotification } from '@/types/notification';

/** `finora-notification` là consumer sự kiện, chưa lộ REST cho client di động. */
const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const listNotifications = (): Promise<AppNotification[]> =>
  isMocked('notification') ? notificationMock.list() : notImplemented('Danh sách thông báo');

export const getUnreadCount = (): Promise<number> =>
  isMocked('notification') ? notificationMock.unreadCount() : notImplemented('Số thông báo mới');

export type HomeSummary = {
  recent: typeof HOME_RECENT;
  chainRef: typeof HOME_CHAIN_REF;
};

/**
 * Hoạt động ví và blockchain trên trang chủ vẫn là dữ liệu demo của các service chưa hoàn thành.
 * Hồ sơ vay không nằm ở đây vì đã được đọc riêng từ API thật của finora-loan.
 */
export const getHomeSummary = (): Promise<HomeSummary> =>
  isMocked('servicing')
    ? mockResponse('servicing', {
        recent: HOME_RECENT,
        chainRef: HOME_CHAIN_REF,
      })
    : notImplemented('Tóm tắt trang chủ');
