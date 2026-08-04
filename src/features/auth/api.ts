import { isMocked } from '@/lib/mockFlag';
import * as authMock from '@/lib/mocks/auth';
import { ApiError } from '@/lib/api';
import type { LoginRequest, OtpChallenge, RegisterRequest, Session, UserProfile } from '@/types/auth';

/**
 * Đăng nhập chưa có endpoint cho client di động — `finora-user` dùng Keycloak
 * nhưng chưa lộ luồng cho mobile. Khi có rồi, thay nhánh HTTP ở đây là đủ,
 * màn hình không phải sửa.
 */
const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const login = (_req: LoginRequest): Promise<OtpChallenge> =>
  isMocked('auth') ? authMock.login() : notImplemented('Đăng nhập');

export const register = (_req: RegisterRequest): Promise<OtpChallenge> =>
  isMocked('auth') ? authMock.register() : notImplemented('Đăng ký');

export const verifyOtp = (code: string): Promise<Session> =>
  isMocked('auth') ? authMock.verifyOtp(code) : notImplemented('Xác thực OTP');

export const getProfile = (): Promise<UserProfile> =>
  isMocked('auth') ? authMock.getProfile() : notImplemented('Hồ sơ người dùng');

export { DEMO_OTP } from '@/lib/mocks/auth';
