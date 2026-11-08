import { useAsync } from '@/hooks/useAsync';
import { getUnreadCount, listNotifications } from '../api';

export const useNotifications = () => useAsync(listNotifications, []);
export const useUnreadCount = () => useAsync(getUnreadCount, []);
