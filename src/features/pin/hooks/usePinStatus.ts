import { useAsync } from '@/hooks/useAsync';
import { getPinStatus } from '../api/pinApi';

/** Trạng thái mã PIN (`GET /users/me/pin`) cho màn Hồ sơ chọn nhãn "Tạo" hay "Đổi" mã PIN. */
export const usePinStatus = () => useAsync(signal => getPinStatus(signal), []);
