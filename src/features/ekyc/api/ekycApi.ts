import { authFetchWithToken } from '@/lib/api';
import { isMocked } from '@/lib/mockFlag';
import * as ekycMock from '@/lib/mocks/ekyc';
import type { EkycVerifyRequest, EkycVerifyResult } from '@/types/ekyc';

/**
 * Endpoint định danh điện tử của `finora-user`, gọi qua Gateway bằng token của
 * phiên đăng nhập (eKYC luôn chạy sau khi đã đăng nhập).
 *
 * Response bọc trong `BaseResponse` của `finora-common`, nên phải bóc `data`
 * ngay tại đây — phần còn lại của feature chỉ làm việc với model nghiệp vụ.
 */

/** Bao response chuẩn của mọi service Java. */
type BaseResponse<T> = { code: number; message: string; data: T };

/**
 * Gửi ảnh hai mặt CCCD để xác minh.
 *
 * Backend OCR mặt trước rồi đối chiếu (hoặc điền) số CCCD của hồ sơ; một lần
 * gọi có thể mất vài chục giây.
 */
export const verifyEkyc = async (request: EkycVerifyRequest): Promise<EkycVerifyResult> => {
  if (isMocked('ekyc')) return ekycMock.verifyEkyc(request);

  const response = await authFetchWithToken<BaseResponse<EkycVerifyResult>>(
    '/users/profile/ekyc-verify',
    { method: 'POST', body: JSON.stringify(request) },
  );
  return response.data;
};
