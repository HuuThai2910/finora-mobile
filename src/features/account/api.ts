import { getMyProfile as fetchProfile } from '@/features/auth';
import { authFetchWithToken } from '@/lib/api';
import { isMocked } from '@/lib/mockFlag';
import * as devicesMock from '@/lib/mocks/devices';
import type { LoginDevice, UserProfile } from '@/types/auth';

/**
 * Hồ sơ người dùng thuộc `finora-user`; feature này lấy lại qua cửa ra của
 * `auth` chứ không tự viết thêm lời gọi trùng chức năng.
 */
export const getMyProfile = (): Promise<UserProfile> => fetchProfile();

/** Thiết bị đã đăng nhập vào tài khoản, gần nhất trước; máy hiện tại nhận ra qua header `X-Device-Id`. */
export const getMyDevices = (): Promise<LoginDevice[]> =>
  isMocked('devices') ? devicesMock.getMyDevices() : authFetchWithToken<LoginDevice[]>('/users/me/devices');

/** Đăng xuất một thiết bị khác (server xóa phiên đăng nhập của thiết bị đó). */
export const signOutDevice = (id: number): Promise<void> =>
  isMocked('devices')
    ? devicesMock.signOutDevice(id)
    : authFetchWithToken<void>(`/users/me/devices/${id}`, { method: 'DELETE' });
