import { useCallback } from 'react';
import { getMyProfile } from '@/features/auth';
import { toUserMessage } from '@/lib/api';
import { refreshAccessToken } from '@/lib/authSession';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Tải lại hồ sơ trong phiên sau khi trạng thái định danh đổi (gửi duyệt, xác minh xong, rút lại hồ sơ), để
 * tab Hồ sơ đổi nhãn ngay mà không cần đăng nhập lại (`useMyProfile` tự tải lại khi trạng thái trong phiên khác
 * bản đang hiển thị). Lỗi chỉ ghi cảnh báo — màn Hồ sơ cũng tự tải lại khi quay về.
 */
export function useRefreshProfile() {
  const { updateProfile } = useAuth();

  return useCallback(async () => {
    try {
      const profile = await getMyProfile();
      updateProfile(profile);
      // Investment đọc trạng thái eKYC từ claim trong access token: lấy token mới để đầu tư được ngay.
      if (profile.kycStatus === 'KYC_VERIFIED') await refreshAccessToken();
    } catch (e) {
      console.warn('Không tải lại được hồ sơ sau eKYC:', toUserMessage(e));
    }
  }, [updateProfile]);
}
