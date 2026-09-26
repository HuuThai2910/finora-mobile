import { getMyProfile as fetchProfile } from '@/features/auth';
import type { UserProfile } from '@/types/auth';

/**
 * Hồ sơ người dùng thuộc `finora-user`; feature này lấy lại qua cửa ra của
 * `auth` chứ không tự viết thêm lời gọi trùng chức năng.
 */
export const getMyProfile = (): Promise<UserProfile> => fetchProfile();
