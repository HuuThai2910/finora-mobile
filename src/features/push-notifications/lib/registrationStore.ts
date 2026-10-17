import { useSyncExternalStore } from 'react';
import type { PushRegistrationState } from '../types';

/**
 * Trạng thái đăng ký push của máy này, dùng chung giữa cầu nối chạy nền (đăng ký lúc mở phiên) và màn Cài đặt thông
 * báo. Đặt ở biến module như `authSession` vì phần đăng xuất trong `AuthProvider` cũng cần `deviceId` mà không phải
 * component con của cầu nối.
 *
 * `deviceId` không phải bí mật (backend chỉ gỡ thiết bị của chính người gọi) và không ghi xuống ổ đĩa: mỗi lần mở
 * phiên app đăng ký lại và backend trả cùng `deviceId` cho cùng token.
 */
let state: PushRegistrationState = { kind: 'idle' };
let deviceId: string | null = null;
const listeners = new Set<() => void>();

export const getRegistrationState = (): PushRegistrationState => state;

export const setRegistrationState = (next: PushRegistrationState): void => {
  state = next;
  listeners.forEach(listener => listener());
};

export const getRegisteredDeviceId = (): string | null => deviceId;

export const setRegisteredDeviceId = (value: string | null): void => {
  deviceId = value;
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Trạng thái đăng ký push cho component; cập nhật ngay khi cầu nối hoặc màn cài đặt đăng ký xong. */
export function usePushRegistrationState(): PushRegistrationState {
  return useSyncExternalStore(subscribe, getRegistrationState, getRegistrationState);
}
