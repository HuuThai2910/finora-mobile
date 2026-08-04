import { isMocked } from '@/lib/mockFlag';
import * as ekycMock from '@/lib/mocks/ekyc';
import { ApiError } from '@/lib/api';
import type { EkycResult, LivenessProgress } from '@/types/ekyc';

/**
 * `finora-ai` có router eKYC nhưng chưa lộ qua gateway cho client di động,
 * nên miền này chạy mock. Thay nhánh HTTP ở đây khi endpoint sẵn sàng.
 */
const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const getLivenessProgress = (): Promise<LivenessProgress> =>
  isMocked('ekyc') ? ekycMock.getLivenessProgress() : notImplemented('Kiểm tra liveness');

export const getResult = (): Promise<EkycResult> =>
  isMocked('ekyc') ? ekycMock.getResult() : notImplemented('Kết quả định danh');
