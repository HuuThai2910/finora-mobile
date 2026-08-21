import { useCallback, useEffect, useRef, useState } from 'react';
import { toUserMessage } from '@/lib/api';
import type { EkycVerifyResult, LivenessChallenge } from '@/types/ekyc';
import { requestLivenessChallenge, verifyEkyc } from '../api/ekycApi';
import { FRAME_COUNT, FRAME_INTERVAL_MS, MIN_FRAMES } from '../constants';

/** Trạng thái của một vòng xác minh, dùng để chọn thông điệp và khoá nút. */
export type CaptureStatus = 'idle' | 'preparing' | 'recording' | 'verifying';

type Options = {
  /** Chụp một frame và trả base64; trả `null` khi frame hỏng để bỏ qua. */
  captureFrame: () => Promise<string | null>;
  /** Ảnh CCCD đã chụp ở màn trước. */
  cccdImageBase64: string | null;
  /** Gọi khi backend đã trả kết quả, bất kể đạt hay trượt. */
  onVerified: (result: EkycVerifyResult) => void;
};

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Điều phối một vòng xác minh: xin thử thách → chụp loạt frame → gửi xác minh.
 *
 * Thử thách chỉ sống 60 giây và dùng được một lần, nên hook cố tình **xin
 * thử thách ngay trước khi quay** thay vì lúc mở màn hình — mở màn rồi để đó
 * vài phút sẽ làm phiên hết hạn trước khi người dùng kịp bấm.
 *
 * Vòng chụp bị huỷ khi rời màn hình: `activeRef` chặn mọi `setState` sau
 * unmount và cắt luôn vòng lặp đang chạy dở.
 */
export function useLivenessCapture({ captureFrame, cccdImageBase64, onVerified }: Options) {
  const [challenge, setChallenge] = useState<LivenessChallenge | null>(null);
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [capturedCount, setCapturedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const activeRef = useRef(true);
  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  const collectFrames = useCallback(async (): Promise<string[]> => {
    const frames: string[] = [];

    for (let i = 0; i < FRAME_COUNT; i += 1) {
      if (!activeRef.current) break;

      const startedAt = Date.now();
      const frame = await captureFrame();
      if (frame) {
        frames.push(frame);
        setCapturedCount(frames.length);
      }

      // Trừ thời gian chụp để nhịp giữa các frame đều nhau trên máy chậm
      const remaining = FRAME_INTERVAL_MS - (Date.now() - startedAt);
      if (remaining > 0) await sleep(remaining);
    }

    return frames;
  }, [captureFrame]);

  const start = useCallback(async () => {
    if (!cccdImageBase64) {
      setError('Chưa có ảnh CCCD, vui lòng chụp lại từ bước trước.');
      return;
    }

    setError(null);
    setCapturedCount(0);
    setStatus('preparing');

    try {
      const nextChallenge = await requestLivenessChallenge();
      if (!activeRef.current) return;
      setChallenge(nextChallenge);

      setStatus('recording');
      const frames = await collectFrames();
      if (!activeRef.current) return;

      if (frames.length < MIN_FRAMES) {
        setStatus('idle');
        setError('Không chụp đủ ảnh để xác minh, vui lòng thử lại.');
        return;
      }

      setStatus('verifying');
      const result = await verifyEkyc({
        sessionId: nextChallenge.sessionId,
        frames,
        cccdImageBase64,
      });
      if (!activeRef.current) return;

      setStatus('idle');
      onVerified(result);
    } catch (e) {
      if (!activeRef.current) return;
      setStatus('idle');
      setError(toUserMessage(e));
    }
  }, [cccdImageBase64, collectFrames, onVerified]);

  return {
    challenge,
    status,
    capturedCount,
    totalFrames: FRAME_COUNT,
    error,
    /** Đang bận thì khoá nút để không mở hai phiên chồng nhau. */
    busy: status !== 'idle',
    start,
  };
}
