import type {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  RegistrationChallenge,
  ResetPasswordRequest,
  UserProfile,
  VerifyRegistrationRequest,
} from '@/types/auth';
import { mockResponse } from './delay';
import { PROFILE } from './fixtures';

/**
 * Phiên giả chỉ dùng khi `EXPO_PUBLIC_MOCK_DOMAINS` chứa `auth`.
 * Giá trị này không phải JWT thật; Loan Service local tự nhận diện người vay
 * bằng `MockCurrentUserProvider`, nên không phụ thuộc nội dung token.
 */
const MOCK_TOKENS: AuthTokens = {
  accessToken: 'finora-mock-borrower-access-token',
  refreshToken: 'finora-mock-borrower-refresh-token',
};

const OTP_EXPIRES_IN_SECONDS = 300;

function registrationChallenge(email: string): RegistrationChallenge {
  const [localPart = '', domain = ''] = email.split('@');
  const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));

  return {
    email,
    maskedEmail: domain ? `${visiblePrefix}***@${domain}` : email,
    otpLength: 6,
    otpExpiresInSeconds: OTP_EXPIRES_IN_SECONDS,
  };
}

export const login = (_request: LoginRequest): Promise<AuthTokens> =>
  mockResponse('auth', MOCK_TOKENS);

export const register = (request: RegisterRequest): Promise<RegistrationChallenge> =>
  mockResponse('auth', registrationChallenge(request.email));

export const resendRegistrationOtp = (email: string): Promise<RegistrationChallenge> =>
  mockResponse('auth', registrationChallenge(email));

export const verifyRegistration = (
  _request: VerifyRegistrationRequest,
): Promise<AuthTokens> => mockResponse('auth', MOCK_TOKENS);

export const refreshTokens = (_refreshToken: string): Promise<AuthTokens> =>
  mockResponse('auth', MOCK_TOKENS);

export const logout = (_refreshToken: string): Promise<void> =>
  mockResponse('auth', undefined);

export const forgotPassword = (_email: string): Promise<void> =>
  mockResponse('auth', undefined);

export const verifyResetOtp = (_email: string, _otp: string): Promise<void> =>
  mockResponse('auth', undefined);

export const resetPassword = (_request: ResetPasswordRequest): Promise<void> =>
  mockResponse('auth', undefined);

export const getMyProfile = (): Promise<UserProfile> => mockResponse('auth', PROFILE);
