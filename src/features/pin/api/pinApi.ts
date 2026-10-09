import { authFetchWithToken } from '@/lib/api';
import type { PinScope, PinStatus, PinVerification } from '../types';

/**
 * Mã PIN giao dịch — `finora-user` tại `/api/v1/users/me/pin`, cùng kênh với hồ sơ `/users/me`.
 *
 * Mã PIN và mật khẩu chỉ đi trong thân request; tầng này không ghi log, không lưu lại.
 * Lỗi nghiệp vụ (`PIN_INCORRECT`, `PIN_LOCKED`...) rơi ra dưới dạng `ApiError` với `message`
 * tiếng Việt của backend, đủ để hiển thị thẳng cho người dùng.
 */
const BASE = '/users/me/pin';

const send = (method: 'POST' | 'PUT', body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

export const getPinStatus = (signal?: AbortSignal): Promise<PinStatus> =>
  authFetchWithToken<PinStatus>(BASE, { signal });

export const createPin = (pin: string): Promise<PinStatus> =>
  authFetchWithToken<PinStatus>(BASE, send('POST', { pin }));

/** Đổi mã PIN lấy token một lần cho đúng phạm vi thao tác sắp gọi. */
export const verifyPin = (pin: string, scope: PinScope): Promise<PinVerification> =>
  authFetchWithToken<PinVerification>(`${BASE}/verify`, send('POST', { pin, scope }));

export const changePin = (currentPin: string, newPin: string): Promise<PinStatus> =>
  authFetchWithToken<PinStatus>(BASE, send('PUT', { currentPin, newPin }));

/** Quên mã PIN: xác minh lại bằng mật khẩu đăng nhập; thành công thì backend gỡ luôn khóa PIN. */
export const resetPin = (password: string, newPin: string): Promise<PinStatus> =>
  authFetchWithToken<PinStatus>(`${BASE}/reset`, send('POST', { password, newPin }));
