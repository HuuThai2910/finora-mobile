import { useCallback } from 'react';
import { useSubmit } from '@/hooks/useSubmit';
import { useAuth } from '@/providers/AuthProvider';
import type { RegisterRequest } from '@/types/auth';
import { register, resendRegistrationOtp, verifyRegistration } from '../api/authApi';
import { normalizeEmail, normalizePhone } from '../schemas/authForms';

/**
 * Bước 1 của đăng ký — gửi thông tin và nhận thử thách OTP.
 *
 * Không thu họ tên: hồ sơ để trống và tên được điền từ OCR CCCD khi quét eKYC.
 * Tài khoản chưa được tạo ở bước này: `finora-user` giữ thông tin trong Redis
 * khoảng 5 phút, hết hạn là phải khai lại từ đầu.
 */
export function useRegistration() {
  const action = useCallback(
    (values: RegisterRequest) =>
      register({
        email: normalizeEmail(values.email),
        phone: normalizePhone(values.phone),
        password: values.password,
      }),
    [],
  );

  return useSubmit(action);
}

/**
 * Bước 2 của đăng ký — xác thực OTP cho một email đang chờ.
 *
 * Mã đúng thì backend tạo tài khoản và trả luôn token, nên người dùng không phải
 * đăng nhập lại. Sai quá 5 lần hoặc quá hạn thì mã bị huỷ và phải yêu cầu mã mới.
 *
 * @param email email đang chờ xác thực, lấy từ tham số điều hướng
 */
export function useRegistrationVerification(email: string) {
  const { signIn } = useAuth();

  const verifyAction = useCallback(
    async (otp: string) => {
      const tokens = await verifyRegistration({ email, otp });
      await signIn(tokens);
      return true;
    },
    [email, signIn],
  );

  const resendAction = useCallback(() => resendRegistrationOtp(email), [email]);

  return {
    verification: useSubmit(verifyAction),
    resend: useSubmit(resendAction),
  };
}
