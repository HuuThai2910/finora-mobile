import { useCallback } from 'react';
import { useSubmit } from '@/hooks/useSubmit';
import type { EkycResultResponse, EkycVerifyRequest } from '@/types/ekyc';
import { startManualReview } from '../api/ekycApi';

/**
 * Gửi lại đúng hai ảnh thẻ để chuyển nhân viên duyệt khi hệ thống xác minh lỗi nhiều lần liên tiếp
 * (`manualReviewAvailable`). Kết quả nghiệp vụ đến trong body 200; `error` dành cho lỗi vận chuyển và
 * `409 MANUAL_REVIEW_UNAVAILABLE` (server chưa thấy đủ số lần lỗi).
 */
export function useEkycManualReview() {
  const action = useCallback(
    (request: EkycVerifyRequest): Promise<EkycResultResponse> => startManualReview(request),
    [],
  );
  return useSubmit(action);
}
