import { mockResponse } from './delay';
import { EKYC_VERIFY_RESULT, LIVENESS_CHALLENGE } from './fixtures';
import type { EkycVerifyRequest, EkycVerifyResult, LivenessChallenge } from '@/types/ekyc';

/**
 * Dữ liệu giả cho miền `ekyc` — cho phép chạy hết luồng trên máy không có
 * backend. Mock vẫn tôn trọng ràng buộc thật của server: thiếu ảnh CCCD hoặc
 * thiếu frame thì trả về đúng mã lỗi mà backend sẽ trả, để màn hình không bị
 * "luôn thành công" khi demo.
 */

export const requestLivenessChallenge = (): Promise<LivenessChallenge> =>
  mockResponse('ekyc', LIVENESS_CHALLENGE);

export const verifyEkyc = (request: EkycVerifyRequest): Promise<EkycVerifyResult> => {
  if (!request.cccdImageBase64) {
    return mockResponse('ekyc', {
      ...EKYC_VERIFY_RESULT,
      status: 'PENDING',
      resultCode: 'OCR_FAILED',
      faceMatch: false,
      faceMatchScore: 0,
      livenessVerified: false,
      message: 'Không đọc được thông tin trên ảnh CCCD, vui lòng chụp lại rõ hơn',
    } satisfies EkycVerifyResult);
  }

  return mockResponse('ekyc', EKYC_VERIFY_RESULT);
};
