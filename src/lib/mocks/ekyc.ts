import { mockResponse } from './delay';
import { EKYC_DRAFT_RESULT } from './fixtures';
import type { EkycVerifyRequest, EkycVerifyResult } from '@/types/ekyc';

/**
 * Dữ liệu giả cho miền `ekyc` — cho phép chạy hết luồng trên máy không có
 * backend. Mock vẫn tôn trọng ràng buộc thật của server: thiếu ảnh mặt nào thì
 * trả đúng mã lỗi mà backend sẽ trả, để màn hình không bị "luôn thành công".
 */

export const verifyEkyc = (request: EkycVerifyRequest): Promise<EkycVerifyResult> => {
  if (!request.cccdFrontBase64 || !request.cccdBackBase64) {
    return mockResponse('ekyc', {
      ...EKYC_DRAFT_RESULT,
      status: 'PENDING',
      resultCode: 'OCR_FAILED',
      draft: null,
      message: 'Không đọc được thông tin trên ảnh mặt trước CCCD, vui lòng chụp lại rõ hơn',
    } satisfies EkycVerifyResult);
  }

  return mockResponse('ekyc', EKYC_DRAFT_RESULT);
};

export const confirmEkyc = (): Promise<EkycVerifyResult> =>
  mockResponse('ekyc', {
    status: 'VERIFIED',
    resultCode: 'VERIFIED',
    ocrWarnings: [],
    message: 'Xác minh eKYC thành công',
    draft: null,
  } satisfies EkycVerifyResult);
