import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { EkycVerifyResult } from '@/types/ekyc';

type EkycSessionValue = {
  /** Ảnh mặt trước CCCD đã chụp, base64 — chỉ tồn tại trong bộ nhớ. */
  cccdImageBase64: string | null;
  setCccdImage: (base64: string) => void;
  /** Kết quả lần xác minh gần nhất, do màn Liveness ghi và màn Result đọc. */
  result: EkycVerifyResult | null;
  setResult: (result: EkycVerifyResult) => void;
  /** Xoá sạch dữ liệu phiên sau khi hoàn tất hoặc khi người dùng bỏ giữa chừng. */
  reset: () => void;
};

const EkycSessionContext = createContext<EkycSessionValue | null>(null);

/**
 * Giữ dữ liệu đi xuyên ba màn eKYC.
 *
 * Ảnh CCCD là chuỗi base64 vài trăm KB nên không được truyền qua navigation
 * params (quy tắc mobile: chỉ truyền identifier và tham số nhỏ), cũng không
 * được ghi xuống đĩa vì là dữ liệu định danh. Context sống đúng bằng vòng đời
 * của luồng xác minh rồi bị xoá.
 */
export function EkycSessionProvider({ children }: { children: React.ReactNode }) {
  const [cccdImageBase64, setCccdImageBase64] = useState<string | null>(null);
  const [result, setResultState] = useState<EkycVerifyResult | null>(null);

  const setCccdImage = useCallback((base64: string) => setCccdImageBase64(base64), []);
  const setResult = useCallback((next: EkycVerifyResult) => setResultState(next), []);
  const reset = useCallback(() => {
    setCccdImageBase64(null);
    setResultState(null);
  }, []);

  const value = useMemo(
    () => ({ cccdImageBase64, setCccdImage, result, setResult, reset }),
    [cccdImageBase64, setCccdImage, result, setResult, reset],
  );

  return <EkycSessionContext.Provider value={value}>{children}</EkycSessionContext.Provider>;
}

export function useEkycSession(): EkycSessionValue {
  const ctx = useContext(EkycSessionContext);
  if (!ctx) throw new Error('useEkycSession phải nằm trong <EkycSessionProvider>');
  return ctx;
}
