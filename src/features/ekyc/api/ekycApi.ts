import { apiFetch } from '@/lib/api';
import { devAuthHeader } from '@/lib/authToken';
import { isMocked } from '@/lib/mockFlag';
import * as ekycMock from '@/lib/mocks/ekyc';
import type { EkycVerifyRequest, EkycVerifyResult, LivenessChallenge } from '@/types/ekyc';

/**
 * Endpoint định danh điện tử của `finora-user`, gọi qua Gateway.
 *
 * Cả hai đều trả bao `BaseResponse` của `finora-common`, nên phải bóc `data`
 * ngay tại đây — phần còn lại của feature chỉ làm việc với model nghiệp vụ.
 *
 * `EXPO_PUBLIC_API_URL` phải trỏ vào Gateway (cổng 8080). Giá trị mặc định
 * trong `lib/api.ts` đang trỏ Loan Service nên sẽ trả 404 cho các path này.
 */

/** Bao response chuẩn của mọi service Java. */
type BaseResponse<T> = { code: number; message: string; data: T };

const post = async <T>(path: string, body?: unknown): Promise<T> => {
  const response = await apiFetch<BaseResponse<T>>(path, {
    method: 'POST',
    headers: devAuthHeader(),
    body: JSON.stringify(body ?? {}),
  });
  return response.data;
};

/**
 * Xin thử thách liveness mới. Mỗi lần gọi huỷ thử thách cũ của cùng người dùng,
 * nên chỉ gọi khi người dùng thật sự sắp quay.
 */
export const requestLivenessChallenge = (): Promise<LivenessChallenge> =>
  isMocked('ekyc')
    ? ekycMock.requestLivenessChallenge()
    : post<LivenessChallenge>('/users/profile/liveness-challenge');

/**
 * Gửi ảnh CCCD và loạt frame để xác minh.
 *
 * Backend chạy tuần tự OCR → đối chiếu số CCCD → liveness → so khớp khuôn mặt
 * và dừng ở bước đầu tiên trượt, nên một lần gọi có thể mất vài chục giây.
 */
export const verifyEkyc = (request: EkycVerifyRequest): Promise<EkycVerifyResult> =>
  isMocked('ekyc')
    ? ekycMock.verifyEkyc(request)
    : post<EkycVerifyResult>('/users/profile/ekyc-verify', request);
