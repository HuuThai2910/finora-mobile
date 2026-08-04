import { useAsync } from '@/hooks/useAsync';
import { getMyProfile, getSettingsMenu } from '../api';

export const useMyProfile = () => useAsync(getMyProfile, []);
export const useSettingsMenu = () => useAsync(getSettingsMenu, []);
