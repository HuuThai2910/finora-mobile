import { authFetchWithToken } from '@/lib/api';
import { isMocked } from '@/lib/mockFlag';
import { mockEkycStatus } from '@/lib/mocks/ekyc';
import type { UserProfile } from '@/types/auth';
import { toUserProfile, type UserProfileDto } from '../mappers/profile';

/**
 * Hồ sơ người dùng — `UserProfileController` của `finora-user` tại `/api/v1/users`.
 * Endpoint yêu cầu quyền `user:profile:read` trong access token.
 */
export const getMyProfile = async (): Promise<UserProfile> => {
  const dto = await authFetchWithToken<UserProfileDto>('/users/me');
  // eKYC chạy bằng API giả (auth luôn thật): trạng thái định danh theo luồng giả vừa làm, để tab Hồ sơ đổi
  // "Đang chờ duyệt" / "Chưa định danh" khớp với màn eKYC khi chụp/kiểm luồng.
  const mocked = isMocked('ekyc') ? mockEkycStatus() : null;
  return toUserProfile(mocked ? { ...dto, ekycStatus: mocked } : dto);
};
