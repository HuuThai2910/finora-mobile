/**
 * Type của miền xác thực và hồ sơ người dùng.
 *
 * Nguồn sự thật là contract của `finora-user`: `AuthController` (đăng ký, đăng
 * nhập, quên mật khẩu) và `UserProfileController` (`GET /users/me`). Phần transport
 * DTO nằm ở `features/auth/api`; ở đây chỉ giữ model mà UI dùng.
 */

/**
 * Trạng thái eKYC hiển thị trên UI. Backend hiện chỉ trả cờ `profileCompleted`
 * nên chỉ hai giá trị đầu là có thật; hai giá trị còn lại giữ chỗ cho khi
 * `finora-user` bổ sung trạng thái duyệt hồ sơ.
 */
export type KycStatus = 'NOT_STARTED' | 'PENDING_REVIEW' | 'KYC_VERIFIED' | 'REJECTED';

/** Vai trò do `finora-user` cấp qua Keycloak. */
export type UserRole = 'BORROWER' | 'INVESTOR' | 'ADMIN';

/** Giới tính theo enum `Gender` của `finora-user`. */
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserProfile {
  id: string;
  fullName: string;
  /** Backend chỉ trả số điện thoại khi hồ sơ đã khai; chưa có thì rỗng. */
  phone: string | null;
  email: string;
  /** Chữ cái đầu dùng cho ảnh đại diện chữ. */
  initial: string;
  kycStatus: KycStatus;
  role: UserRole;
  /** Ngày sinh dạng ISO `yyyy-MM-dd`, khai qua eKYC; chưa khai thì rỗng. */
  dateOfBirth: string | null;
  gender: Gender | null;
  placeOfOrigin: string | null;
  address: string | null;
  /** Số CCCD đã giải mã — backend chỉ trả cho chính chủ hồ sơ. */
  idNumber: string | null;
  /**
   * Điểm và hạng tín dụng do `finora-ai` chấm, chưa lộ ra `GET /users/me`.
   * Giữ `null` cho tới khi có contract thay vì hiển thị số tự bịa.
   */
  creditGrade: 'A' | 'B' | 'C' | 'D' | null;
  creditScore: number | null;
  linkedBank: { bank: string; maskedNumber: string; holder: string; verified: boolean } | null;
}

/** Cặp token của phiên đăng nhập. Chỉ mobile mới nhận token trong body. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Session {
  tokens: AuthTokens;
  profile: UserProfile;
}

/** Phản hồi bước 1 của đăng ký — OTP đã gửi, tài khoản chưa được tạo. */
export interface RegistrationChallenge {
  email: string;
  /** Email đã che bớt, dùng để hiển thị trên màn nhập OTP. */
  maskedEmail: string;
  otpLength: number;
  otpExpiresInSeconds: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface VerifyRegistrationRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}
