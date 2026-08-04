import { isMocked } from '@/lib/mockFlag';
import * as notificationMock from '@/lib/mocks/notification';
import { HOME_CHAIN_REF, HOME_LOAN, HOME_RECENT } from '@/lib/mocks/fixtures';
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
  loan: typeof HOME_LOAN;
  recent: typeof HOME_RECENT;
  chainRef: typeof HOME_CHAIN_REF;
};

/**
 * Tóm tắt trang chủ. Khi backend sẵn sàng, phần này gộp từ `finora-loan`
 * (khoản vay đang chạy) và `finora-payment` (giao dịch gần đây).
 */
export const getHomeSummary = (): Promise<HomeSummary> =>
  isMocked('servicing')
    ? mockResponse('servicing', {
        loan: HOME_LOAN,
        recent: HOME_RECENT,
        chainRef: HOME_CHAIN_REF,
      })
    : notImplemented('Tóm tắt trang chủ');
