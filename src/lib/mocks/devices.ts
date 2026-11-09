import type { LoginDevice } from '@/types/auth';
import { mockResponse } from './delay';

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

/** Ba thiết bị mẫu: máy đang dùng, một trình duyệt và một điện thoại cũ. */
let devices: LoginDevice[] = [
  {
    id: 1, deviceName: 'iPhone', osName: 'iOS 18.1', clientType: 'MOBILE', appVersion: '1.0.0',
    ipAddress: '113.161.*.*', firstLoginAt: hoursAgo(24 * 40), lastLoginAt: hoursAgo(0.2), loginCount: 37,
    current: true, canSignOut: false,
  },
  {
    id: 2, deviceName: 'Chrome trên Windows', osName: 'Windows', clientType: 'WEB', appVersion: null,
    ipAddress: '14.232.*.*', firstLoginAt: hoursAgo(24 * 12), lastLoginAt: hoursAgo(26), loginCount: 5,
    current: false, canSignOut: true,
  },
  {
    id: 3, deviceName: 'samsung SM-S918B', osName: 'Android 14', clientType: 'MOBILE', appVersion: '0.9.2',
    ipAddress: '27.72.*.*', firstLoginAt: hoursAgo(24 * 90), lastLoginAt: hoursAgo(24 * 21), loginCount: 12,
    current: false, canSignOut: true,
  },
];

export const getMyDevices = (): Promise<LoginDevice[]> => mockResponse('devices', devices);

export const signOutDevice = (id: number): Promise<void> => {
  devices = devices.filter(device => device.id !== id);
  return mockResponse('devices', undefined);
};
