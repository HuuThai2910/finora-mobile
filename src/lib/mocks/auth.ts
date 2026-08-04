import { mockResponse } from './delay';
import { PROFILE } from './fixtures';
import type { OtpChallenge, Session, UserProfile } from '@/types/auth';

export const login = (): Promise<OtpChallenge> =>
  mockResponse('auth', { maskedPhone: PROFILE.phone, length: 6, expiresInSeconds: 42 });

export const register = (): Promise<OtpChallenge> =>
  mockResponse('auth', { maskedPhone: PROFILE.phone, length: 6, expiresInSeconds: 42 });

/** Mã đúng cố định trong bản demo — trùng với mã hiển thị sẵn trong mockup. */
export const DEMO_OTP = '482913';

export const verifyOtp = (code: string): Promise<Session> =>
  mockResponse('auth', {
    accessToken: `demo-${code}`,
    profile: PROFILE,
  });

export const getProfile = (): Promise<UserProfile> => mockResponse('auth', PROFILE);
