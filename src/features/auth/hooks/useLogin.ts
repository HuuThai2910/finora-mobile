import { useCallback } from 'react';
import { useSubmit } from '@/hooks/useSubmit';
import { useAuth } from '@/providers/AuthProvider';
import { login } from '../api/authApi';
import { normalizeEmail } from '../schemas/authForms';

/**
 * Đăng nhập bằng email và mật khẩu.
 *
 * `finora-user` không dùng OTP cho đăng nhập: mật khẩu đúng là Keycloak cấp token
 * ngay. Hồ sơ người dùng do `AuthProvider.signIn` tải tiếp, vì `RootNavigator`
 * cần biết eKYC đã xong chưa mới quyết định vào màn nào.
 *
 * @returns `submit` trả `true` khi đã mở được phiên, `null` khi thất bại.
 */
export function useLogin() {
  const { signIn } = useAuth();

  const action = useCallback(
    async (values: { email: string; password: string }) => {
      const tokens = await login({
        email: normalizeEmail(values.email),
        password: values.password,
      });

      await signIn(tokens);
      return true;
    },
    [signIn],
  );

  return useSubmit(action);
}
