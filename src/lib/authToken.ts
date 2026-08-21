/**
 * Header xác thực tạm thời cho giai đoạn tích hợp eKYC.
 *
 * Đăng nhập thật trên mobile chưa nối: `features/auth/api.ts` vẫn trả `501` và
 * chưa có secure storage. Trong khi đó các endpoint eKYC của `finora-user` đều
 * yêu cầu JWT có quyền `user:cccd:scan`, nên không có token thì không thử được
 * gì với backend thật.
 *
 * Token lấy từ `EXPO_PUBLIC_DEV_JWT` — biến này bị nhúng vào bundle nên **chỉ
 * dùng token của tài khoản thử nghiệm ở máy phát triển**, không bao giờ đặt
 * token thật vào đây.
 *
 * TODO(MOBILE-EKYC-001, Hải): xoá file này khi luồng đăng nhập thật gắn được
 * `Authorization` vào `apiFetch` từ secure storage.
 */
export function devAuthHeader(): Record<string, string> {
  const token = process.env.EXPO_PUBLIC_DEV_JWT;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
