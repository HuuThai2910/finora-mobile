import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { EkycVerifyResult } from '@/types/ekyc';

/** Hai mặt CCCD phải chụp theo thứ tự trước → sau. */
export type CccdSide = 'front' | 'back';

type EkycSessionValue = {
  /** Ảnh mặt trước CCCD đã chụp, base64 — chỉ tồn tại trong bộ nhớ. */
  cccdFrontBase64: string | null;
  /** Ảnh mặt sau CCCD đã chụp, base64 — chỉ tồn tại trong bộ nhớ. */
  cccdBackBase64: string | null;
  setCccdImage: (side: CccdSide, base64: string) => void;
  /** Kết quả lần xác minh gần nhất, do màn chụp mặt sau ghi và màn Result đọc. */
  result: EkycVerifyResult | null;
  setResult: (result: EkycVerifyResult) => void;
  /** Xoá sạch dữ liệu phiên sau khi hoàn tất hoặc khi người dùng bỏ giữa chừng. */
  reset: () => void;
};

const EkycSessionContext = createContext<EkycSessionValue | null>(null);

/**
 * Giữ dữ liệu đi xuyên các màn eKYC.
 *
 * Ảnh CCCD là chuỗi base64 vài trăm KB nên không được truyền qua navigation
 * params (quy tắc mobile: chỉ truyền identifier và tham số nhỏ), cũng không
 * được ghi xuống đĩa vì là dữ liệu định danh. Context sống đúng bằng vòng đời
 * của luồng xác minh rồi bị xoá.
 */
export function EkycSessionProvider({ children }: { children: React.ReactNode }) {
  const [cccdFrontBase64, setFront] = useState<string | null>(null);
  const [cccdBackBase64, setBack] = useState<string | null>(null);
  const [result, setResultState] = useState<EkycVerifyResult | null>(null);

  const setCccdImage = useCallback((side: CccdSide, base64: string) => {
    if (side === 'front') setFront(base64);
    else setBack(base64);
  }, []);
  const setResult = useCallback((next: EkycVerifyResult) => setResultState(next), []);
  const reset = useCallback(() => {
    setFront(null);
    setBack(null);
    setResultState(null);
  }, []);

  const value = useMemo(
    () => ({ cccdFrontBase64, cccdBackBase64, setCccdImage, result, setResult, reset }),
    [cccdFrontBase64, cccdBackBase64, setCccdImage, result, setResult, reset],
  );

  return <EkycSessionContext.Provider value={value}>{children}</EkycSessionContext.Provider>;
}

export function useEkycSession(): EkycSessionValue {
  const ctx = useContext(EkycSessionContext);
  if (!ctx) throw new Error('useEkycSession phải nằm trong <EkycSessionProvider>');
  return ctx;
}
