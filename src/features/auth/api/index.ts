/**
 * Cửa ra dữ liệu của feature `auth`.
 *
 * Tách khỏi `../index.ts` (vốn xuất màn hình) để tầng ứng dụng — cụ thể là
 * `AuthProvider` — dùng được các lời gọi API mà không kéo theo cây màn hình,
 * tránh vòng import giữa provider và screen.
 */
export {
  login,
  register,
  resendRegistrationOtp,
  verifyRegistration,
  refreshTokens,
  logout,
  forgotPassword,
  resetPassword,
} from './authApi';
export { getMyProfile } from './profileApi';
