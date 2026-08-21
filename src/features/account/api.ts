import { getMyProfile as fetchProfile } from '@/features/auth';
import { PROFILE_MENU } from '@/lib/mocks/fixtures';
import type { UserProfile } from '@/types/auth';

/**
 * Hồ sơ người dùng thuộc `finora-user`; feature này lấy lại qua cửa ra của
 * `auth` chứ không tự viết thêm lời gọi trùng chức năng.
 */
export const getMyProfile = (): Promise<UserProfile> => fetchProfile();

/** Danh sách mục cài đặt — nội dung tĩnh, chưa gắn với backend. */
export const getSettingsMenu = () => Promise.resolve(PROFILE_MENU);
