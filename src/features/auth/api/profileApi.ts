import { authFetchWithToken } from '@/lib/api';
import type { UserProfile } from '@/types/auth';
import { toUserProfile, type UserProfileDto } from '../mappers/profile';

/**
 * Hồ sơ người dùng — `UserProfileController` của `finora-user` tại `/api/v1/users`.
 * Endpoint yêu cầu quyền `user:profile:read` trong access token.
 */
export const getMyProfile = async (): Promise<UserProfile> => {
  return toUserProfile(await authFetchWithToken<UserProfileDto>('/users/me'));
};
