import { useAsync } from '@/hooks/useAsync';
import { getHomeSummary, getUnreadCount, listNotifications } from '../api';

export const useHomeSummary = () => useAsync(getHomeSummary, []);
export const useNotifications = () => useAsync(listNotifications, []);
export const useUnreadCount = () => useAsync(getUnreadCount, []);
