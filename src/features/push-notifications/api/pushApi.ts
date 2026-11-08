import { notificationFetch } from '@/lib/api';
import type { DevicePlatform, PreferencesDto, RegisteredDeviceDto } from '../types';

/**
 * Đăng ký hoặc làm mới Expo push token của máy này. Backend upsert theo token (gọi lại mỗi lần mở phiên không tạo
 * bản ghi thừa) và lấy người sở hữu từ access token, không từ body.
 */
export const registerDevice = (token: string, platform: DevicePlatform): Promise<RegisteredDeviceDto> =>
  notificationFetch<RegisteredDeviceDto>('/notifications/devices', {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
    timeoutMs: 15000,
  });

/**
 * Gỡ thiết bị khi đăng xuất. Nhận access token chụp lại trước khi phiên bị xóa: lời gọi chạy song song với lúc
 * `AuthProvider` dọn phiên, nên không được đọc token từ phiên lúc gửi.
 */
export const unregisterDevice = (deviceId: string, accessToken: string): Promise<void> =>
  notificationFetch<void>(`/notifications/devices/${encodeURIComponent(deviceId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
    timeoutMs: 5000,
  });

export const getPreferences = (signal?: AbortSignal): Promise<PreferencesDto> =>
  notificationFetch<PreferencesDto>('/notifications/preferences', { signal, timeoutMs: 15000 });

/** Bật/tắt push cho mọi nhóm gửi lên trong một lần `PUT`; nhóm không gửi giữ nguyên ở backend. */
export const updatePushForCategories = (categories: string[], pushEnabled: boolean): Promise<PreferencesDto> =>
  notificationFetch<PreferencesDto>('/notifications/preferences', {
    method: 'PUT',
    body: JSON.stringify({ preferences: categories.map(category => ({ category, pushEnabled })) }),
    timeoutMs: 15000,
  });
