import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { EkycResultResponse, EkycRetakeItem } from '@/types/ekyc';
import { retakeMessage } from '../constants/messages';
import { toCccdSide, type CardShot, type CccdSide } from '../capture/types';

export type { CccdSide } from '../capture/types';

type RetakeState = {
  /** Lý do server vừa trả, hiện trên màn chụp lại; xoá khi đã có ảnh mới. */
  notice: string | null;
};

type Shots = Record<CccdSide, CardShot | null>;
type Retakes = Record<CccdSide, RetakeState>;

const NO_SHOTS: Shots = { front: null, back: null };
const NO_RETAKES: Retakes = {
  front: { notice: null },
  back: { notice: null },
};

type EkycSessionValue = {
  /** Phiên bản điều khoản người dùng vừa đồng ý — gửi kèm khi quét thẻ. */
  consentVersion: string | null;
  setConsentVersion: (version: string) => void;
  /** Ảnh hai mặt đã xử lý (base64 + QR + nguồn) — chỉ tồn tại trong bộ nhớ. */
  shots: Shots;
  setShot: (side: CccdSide, shot: CardShot | null) => void;
  retake: Retakes;
  /**
   * Ghi một kết quả RETAKE: mặt bị yêu cầu thì xoá ảnh, đặt lời nhắc; mặt còn lại xoá lời nhắc. Trả các mặt cần chụp
   * lại, mặt trước đứng trước.
   */
  applyRetake: (items: readonly EkycRetakeItem[], fallbackMessage: string) => CccdSide[];
  /** Quét đạt — giữ bản nháp (DRAFT_READY) cho màn soát sau bước liveness. */
  draftResult: EkycResultResponse | null;
  setDraftResult: (result: EkycResultResponse) => void;
  /** Kết quả màn Kết quả đang hiển thị: liveness đạt, chờ duyệt, thành công hoặc bị từ chối. */
  outcome: EkycResultResponse | null;
  setOutcome: (result: EkycResultResponse) => void;
  /** Số lần người dùng đã bấm "Sai thông tin — Chụp lại" trong phiên; giữ qua các lần chụp lại, xoá khi `reset`. */
  incorrectReports: number;
  /** Ghi một lần báo sai (trước khi chụp lại từ đầu). */
  countIncorrectReport: () => void;
  /** Làm lại từ bước chụp thẻ, giữ phiên bản điều khoản đã đồng ý. */
  restartCapture: () => void;
  /** Xoá sạch phiên — khi hoàn tất, rút lại đồng ý hoặc phải đọc lại điều khoản. */
  reset: () => void;
};

const EkycSessionContext = createContext<EkycSessionValue | null>(null);

/**
 * Giữ dữ liệu đi xuyên các màn eKYC.
 *
 * Ảnh CCCD là chuỗi base64 vài trăm KB nên không được truyền qua navigation params (quy tắc
 * mobile: chỉ truyền identifier và tham số nhỏ), cũng không được ghi xuống đĩa vì là dữ liệu
 * định danh. Context sống đúng bằng vòng đời của stack Hồ sơ (tab bị gỡ khi rời đi) và bị
 * xoá khi luồng kết thúc.
 */
export function EkycSessionProvider({ children }: { children: React.ReactNode }) {
  const [consentVersion, setConsentVersionState] = useState<string | null>(null);
  const [shots, setShots] = useState<Shots>(NO_SHOTS);
  const [retake, setRetake] = useState<Retakes>(NO_RETAKES);
  const [draftResult, setDraftResultState] = useState<EkycResultResponse | null>(null);
  const [outcome, setOutcomeState] = useState<EkycResultResponse | null>(null);
  const [incorrectReports, setIncorrectReports] = useState(0);

  const setConsentVersion = useCallback((version: string) => setConsentVersionState(version), []);

  const setShot = useCallback((side: CccdSide, shot: CardShot | null) => {
    setShots(prev => ({ ...prev, [side]: shot }));
    // Đã có ảnh mới thì lời nhắc chụp lại hết tác dụng.
    if (shot) setRetake(prev => ({ ...prev, [side]: { notice: null } }));
  }, []);

  const applyRetake = useCallback((items: readonly EkycRetakeItem[], fallbackMessage: string) => {
    const messages: Record<CccdSide, string[]> = { front: [], back: [] };
    items.forEach(item => messages[toCccdSide(item.side)].push(retakeMessage(item)));
    // RETAKE không kèm mặt nào (không đúng contract) — an toàn nhất là chụp lại cả hai mặt.
    if (items.length === 0) {
      messages.front.push(fallbackMessage);
      messages.back.push(fallbackMessage);
    }

    const sides = (['front', 'back'] as const).filter(side => messages[side].length > 0);
    setRetake({
      front: { notice: sides.includes('front') ? Array.from(new Set(messages.front)).join('\n') : null },
      back: { notice: sides.includes('back') ? Array.from(new Set(messages.back)).join('\n') : null },
    });
    setShots(prev => ({
      front: sides.includes('front') ? null : prev.front,
      back: sides.includes('back') ? null : prev.back,
    }));
    return sides;
  }, []);

  const setDraftResult = useCallback((result: EkycResultResponse) => {
    setDraftResultState(result);
    // Quét đạt thì xoá lời nhắc chụp lại.
    setRetake(NO_RETAKES);
  }, []);

  const setOutcome = useCallback((result: EkycResultResponse) => setOutcomeState(result), []);

  const countIncorrectReport = useCallback(() => setIncorrectReports(count => count + 1), []);

  const restartCapture = useCallback(() => {
    setShots(NO_SHOTS);
    setRetake(NO_RETAKES);
    setDraftResultState(null);
    setOutcomeState(null);
  }, []);

  const reset = useCallback(() => {
    restartCapture();
    setConsentVersionState(null);
    setIncorrectReports(0);
  }, [restartCapture]);

  const value = useMemo(
    () => ({
      consentVersion,
      setConsentVersion,
      shots,
      setShot,
      retake,
      applyRetake,
      draftResult,
      setDraftResult,
      outcome,
      setOutcome,
      incorrectReports,
      countIncorrectReport,
      restartCapture,
      reset,
    }),
    [
      consentVersion,
      setConsentVersion,
      shots,
      setShot,
      retake,
      applyRetake,
      draftResult,
      setDraftResult,
      outcome,
      setOutcome,
      incorrectReports,
      countIncorrectReport,
      restartCapture,
      reset,
    ],
  );

  return <EkycSessionContext.Provider value={value}>{children}</EkycSessionContext.Provider>;
}

export function useEkycSession(): EkycSessionValue {
  const ctx = useContext(EkycSessionContext);
  if (!ctx) throw new Error('useEkycSession phải nằm trong <EkycSessionProvider>');
  return ctx;
}
