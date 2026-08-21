import { useCallback } from 'react';
import { useSubmit } from '@/hooks/useSubmit';
import type { EkycVerifyResult } from '@/types/ekyc';
import { verifyEkyc } from '../api/ekycApi';

/**
 * Gửi ảnh hai mặt CCCD để xác minh.
 *
 * Backend trả kết quả nghiệp vụ (đạt/trượt kèm `resultCode`) trong body 200,
 * nên mọi kết quả — kể cả trượt — đều đi qua nhánh thành công của `useSubmit`;
 * `error` chỉ dành cho lỗi vận chuyển (mất mạng, 401, 5xx).
 */
export function useEkycVerify() {
  const action = useCallback(
    async (front: string, back: string): Promise<EkycVerifyResult> =>
      verifyEkyc({ cccdFrontBase64: front, cccdBackBase64: back }),
    [],
  );

  return useSubmit(action);
}
