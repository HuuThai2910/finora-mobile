import { useCallback } from 'react';
import { useSubmit } from '@/hooks/useSubmit';
import type { EkycResultResponse, EkycVerifyRequest } from '@/types/ekyc';
import { verifyEkyc } from '../api/ekycApi';

/**
 * Gửi ảnh hai mặt CCCD để server đọc thẻ (QR → MRZ → chữ in → AI chỉ điền chỗ trống).
 *
 * Backend trả kết quả nghiệp vụ (đạt / chụp lại / từ chối) trong body 200, nên mọi kết quả đều
 * đi qua nhánh thành công của `useSubmit`; `error` chỉ dành cho lỗi vận chuyển (mất mạng,
 * hết thời gian chờ, 401, 5xx). Cờ chống bấm lặp của `useSubmit` ngăn gửi hai lần.
 */
export function useEkycVerify() {
  const action = useCallback(
    (request: EkycVerifyRequest): Promise<EkycResultResponse> => verifyEkyc(request),
    [],
  );
  return useSubmit(action);
}
