import { useAsync } from '@/hooks/useAsync';
import { getLivenessProgress, getResult } from '../api';

export const useLiveness = () => useAsync(getLivenessProgress, []);

export const useEkycResult = () => useAsync(getResult, []);
