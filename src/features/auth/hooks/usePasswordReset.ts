import { useCallback } from 'react';
import { useSubmit } from '@/hooks/useSubmit';
import { forgotPassword, resetPassword, verifyResetOtp } from '../api/authApi';
import { normalizeEmail } from '../schemas/authForms';

/**
 * Bước 1 của quên mật khẩu — yêu cầu gửi mã OTP tới email.
 *
 * Backend luôn trả thành công kể cả khi email không tồn tại, để không lộ email
 * nào đã đăng ký. Vì vậy UI không được kết luận "email hợp lệ" từ kết quả này.
 */
export function useForgotPassword() {
  const action = useCallback(async (email: string) => {
    await forgotPassword(normalizeEmail(email));
    return true;
  }, []);

  return useSubmit(action);
}

/**
 * Bước 2 của quên mật khẩu — gửi lại mã OTP từ màn nhập mã.
 *
 * @param email email đã yêu cầu mã, lấy từ tham số điều hướng
 */
export function useResendResetOtp(email: string) {
  const action = useCallback(async () => {
    await forgotPassword(normalizeEmail(email));
    return true;
  }, [email]);

  return useSubmit(action);
}

/**
 * Bước 2 của quên mật khẩu — kiểm tra mã OTP trước khi cho qua màn mật khẩu mới.
 *
 * Backend chỉ kiểm tra chứ không tiêu huỷ mã, nên màn sau vẫn gửi lại đúng mã
 * này khi chốt. Mỗi lần kiểm tra tính một lần thử trong hạn mức chống dò mã.
 *
 * @param email email đã yêu cầu mã, lấy từ tham số điều hướng
 */
export function useVerifyResetOtp(email: string) {
  const action = useCallback(
    async (otp: string) => {
      await verifyResetOtp(normalizeEmail(email), otp);
      return true;
    },
    [email],
  );

  return useSubmit(action);
}

/**
 * Bước 3 của quên mật khẩu — đổi mật khẩu bằng mã OTP nhận qua email.
 *
 * Đây vẫn là bước xác thực cuối: mã đã qua được màn kiểm tra nhưng có thể hết
 * hạn trong lúc người dùng nhập mật khẩu, khi đó lỗi hiện ở màn này.
 *
 * @param email email đã yêu cầu mã, lấy từ tham số điều hướng
 */
export function useResetPassword(email: string) {
  const action = useCallback(
    async (values: { otp: string; newPassword: string }) => {
      await resetPassword({
        email: normalizeEmail(email),
        otp: values.otp,
        newPassword: values.newPassword,
      });
      return true;
    },
    [email],
  );

  return useSubmit(action);
}
