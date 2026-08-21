import { ApiError, authFetch, authFetchWithToken } from '@/lib/api';
import type {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  RegistrationChallenge,
  ResetPasswordRequest,
  VerifyRegistrationRequest,
} from '@/types/auth';

/**
 * Transport của `finora-user` — `AuthController` tại `/api/v1/auth`.
 *
 * Header `X-Client-Type: mobile` do `@/lib/api` gắn sẵn cho mọi request, nhờ đó
 * backend trả token trong body thay vì đặt cookie.
 */

/** `AuthResponse` của backend. Token chỉ có mặt với client mobile. */
type AuthResponseDto = {
  userId: number | null;
  email: string | null;
  fullName: string | null;
  roles: string[] | null;
  accessToken?: string;
  refreshToken?: string;
};

/** `RegistrationChallengeResponse` của backend. */
type RegistrationChallengeDto = {
  email: string;
  maskedEmail: string;
  otpLength: number;
  otpExpiresInSeconds: number;
};

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body),
});

/**
 * Backend chỉ trả token khi nhận đúng header client mobile. Thiếu token nghĩa là
 * cấu hình sai chứ không phải lỗi người dùng, nên báo bằng lỗi kỹ thuật rõ ràng.
 */
function requireTokens(dto: AuthResponseDto): AuthTokens {
  if (!dto.accessToken || !dto.refreshToken) {
    throw new ApiError(
      500,
      'Phản hồi xác thực thiếu token',
      'MISSING_TOKENS',
      'Máy chủ không trả về phiên đăng nhập. Vui lòng thử lại sau.',
    );
  }
  return { accessToken: dto.accessToken, refreshToken: dto.refreshToken };
}

export const login = async (req: LoginRequest): Promise<AuthTokens> =>
  requireTokens(await authFetch<AuthResponseDto>('/auth/login', json(req)));

/**
 * Bước 1 của đăng ký — backend gửi OTP qua email, chưa tạo tài khoản.
 * Không gửi họ tên: hồ sơ để trống, tên được điền từ OCR CCCD khi quét eKYC.
 */
export const register = (req: RegisterRequest): Promise<RegistrationChallenge> =>
  authFetch<RegistrationChallengeDto>(
    '/auth/register',
    json({
      email: req.email,
      password: req.password,
      phone: req.phone,
    }),
  );

export const resendRegistrationOtp = (email: string): Promise<RegistrationChallenge> =>
  authFetch<RegistrationChallengeDto>('/auth/register/resend-otp', json({ email }));

/** Bước 2 của đăng ký — mã đúng thì tài khoản được tạo và đăng nhập luôn. */
export const verifyRegistration = async (
  req: VerifyRegistrationRequest,
): Promise<AuthTokens> =>
  requireTokens(await authFetch<AuthResponseDto>('/auth/verify-registration', json(req)));

/**
 * Đổi refresh token lấy cặp token mới. Keycloak xoay vòng refresh token nên
 * giá trị cũ hết hiệu lực ngay sau lời gọi này.
 */
export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> =>
  requireTokens(await authFetch<AuthResponseDto>('/auth/refresh', json({ refreshToken })));

/** Thu hồi refresh token phía Keycloak. Cần access token nên gọi qua kênh đã xác thực. */
export const logout = (refreshToken: string): Promise<void> =>
  authFetchWithToken<void>('/auth/logout', json({ refreshToken }));

/**
 * Backend cố tình trả 200 kể cả khi email không tồn tại để không lộ tài khoản nào
 * có thật. UI vì vậy luôn hiển thị "đã gửi mã nếu email tồn tại".
 */
export const forgotPassword = (email: string): Promise<void> =>
  authFetch<void>('/auth/forgot-password', json({ email }));

/**
 * Kiểm tra OTP trước khi cho nhập mật khẩu mới. Backend không tiêu huỷ mã ở bước
 * này — `resetPassword` vẫn gửi lại chính mã đó và là bước xác thực cuối cùng.
 * Mã sai/hết hạn trả 400 với thông báo dùng chung "Mã không hợp lệ hoặc đã hết hạn".
 */
export const verifyResetOtp = (email: string, otp: string): Promise<void> =>
  authFetch<void>('/auth/verify-reset-otp', json({ email, otp }));

export const resetPassword = (req: ResetPasswordRequest): Promise<void> =>
  authFetch<void>('/auth/reset-password', json(req));
