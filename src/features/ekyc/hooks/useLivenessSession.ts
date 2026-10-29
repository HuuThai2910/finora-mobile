import { useCallback, useEffect, useRef, useState } from 'react';
import { toUserMessage } from '@/lib/api';
import { CLIENT_PLATFORM } from '@/lib/appInfo';
import { discardTempFile } from '@/lib/camera';
import type { EkycResultResponse, LivenessChallenge, LivenessStep, LivenessSubmission } from '@/types/ekyc';
import { requestLivenessChallenge, submitLiveness } from '../api/ekycApi';
import {
  CAMERA_NOT_READY_NOTICE,
  COUNTDOWN_SECONDS,
  INTERRUPTED_NOTICE,
  STILLS_FALLBACK_NOTICE,
} from '../constants/liveness';
import { LivenessCaptureError } from '../liveness/captureError';
import { sleep } from '../liveness/schedule';
import { routeAfterLiveness, routeChallengeError, type LivenessRoute } from '../mappers/result';
import { useLivenessRecorder, type CapturedLiveness } from './useLivenessRecorder';
import { useScreenBrightness } from './useScreenBrightness';

export type LivenessNotice = { tone: 'info' | 'warn' | 'error'; text: string };

export type LivenessPhase =
  | { kind: 'intro'; notice: LivenessNotice | null }
  | { kind: 'preparing'; notice: LivenessNotice | null }
  | { kind: 'countdown'; seconds: number }
  | { kind: 'recording' }
  | { kind: 'uploading' }
  | { kind: 'blocked'; action: 'RESTART_CAPTURE' | 'CONSENT'; message: string };

type Options = {
  /** Liveness đạt hoặc vùng xám — sang màn soát và xác nhận. */
  onReview: (result: EkycResultResponse) => void;
  /** Hồ sơ đã sang trạng thái cuối (ví dụ chờ duyệt tay sau 3 lần trượt). */
  onFinal: (result: EkycResultResponse) => void;
};

const intro = (notice: LivenessNotice | null): LivenessPhase => ({ kind: 'intro', notice });

const CAPTURE_FAILED_NOTICE = 'Chưa ghi được hình khuôn mặt. Vui lòng thử lại.';

/** Request multipart và danh sách tệp tạm cần xoá sau khi gửi. */
function toSubmission(challenge: LivenessChallenge, captured: CapturedLiveness) {
  const common = { sessionId: challenge.sessionId, platform: CLIENT_PLATFORM };
  if (captured.mode === 'VIDEO') {
    const submission: LivenessSubmission = { ...common, captureMode: 'VIDEO', video: captured.video };
    return { submission, files: [captured.video.uri] };
  }
  const submission: LivenessSubmission = {
    ...common,
    captureMode: 'STILLS',
    frames: captured.frames,
    frameTimesMs: captured.frameTimesMs,
  };
  return { submission, files: captured.frames.map(frame => frame.uri) };
}

/**
 * Điều phối một lượt kiểm tra khuôn mặt: xin thử thách (ngay trước khi quay vì chỉ sống 90 giây)
 * → áp thông số video → đếm ngược → tăng độ sáng và quay theo lịch nhắc → upload multipart →
 * định tuyến theo `resultCode` (xem `routeAfterLiveness`).
 *
 * `recordAsync` lỗi hoặc không trả tệp thì tự xin thử thách mới và chạy chế độ ảnh liên tiếp
 * (một lần). Video/ảnh bị xoá khỏi cache sau khi gửi. Không `setState` sau khi rời màn; cờ
 * `running` chặn bấm "Bắt đầu" hai lần.
 */
export function useLivenessSession({ onReview, onFinal }: Options) {
  const recorder = useLivenessRecorder();
  const { prepare, capture, currentMode, switchToStills } = recorder;
  const { raise, restore } = useScreenBrightness();
  const [phase, setPhase] = useState<LivenessPhase>(intro(null));
  const [steps, setSteps] = useState<LivenessStep[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const mounted = useRef(true);
  const running = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const show = useCallback((next: LivenessPhase) => {
    if (mounted.current) setPhase(next);
  }, []);

  const applyRoute = useCallback(
    (route: LivenessRoute, result: EkycResultResponse | null) => {
      // Người dùng đã rời màn trong lúc chờ server: không tự chuyển màn sau lưng họ.
      if (!mounted.current) return;
      if (route.kind === 'REVIEW' && result) {
        // Về lại trạng thái đầu để nếu người dùng quay lại màn này (ví dụ server báo
        // LIVENESS_REQUIRED lúc xác nhận) thì bấm quay được ngay.
        show(intro(null));
        onReview(result);
      } else if (route.kind === 'FINAL') {
        onFinal(route.outcome);
      } else if (route.kind === 'RETRY') {
        show(intro({ tone: route.tone, text: route.message }));
      } else if (route.kind === 'RESTART_CAPTURE' || route.kind === 'CONSENT') {
        show({ kind: 'blocked', action: route.kind, message: route.message });
      }
    },
    [onFinal, onReview, show],
  );

  /** Quay theo chế độ hiện tại; `null` khi không ra được tệp (đã hiển thị lý do), `'fallback'` để chuyển STILLS. */
  const record = useCallback(
    async (challenge: LivenessChallenge): Promise<CapturedLiveness | 'fallback' | null> => {
      try {
        return await capture(challenge, index => {
          if (mounted.current) setStepIndex(index);
        });
      } catch (e) {
        if (!(e instanceof LivenessCaptureError)) {
          show(intro({ tone: 'error', text: toUserMessage(e) }));
          return null;
        }
        if (e.reason === 'VIDEO_UNSUPPORTED' && currentMode() === 'VIDEO') return 'fallback';
        if (e.reason === 'INTERRUPTED') show(intro({ tone: 'warn', text: INTERRUPTED_NOTICE }));
        if (e.reason === 'NO_FRAMES' || e.reason === 'VIDEO_UNSUPPORTED') {
          show(intro({ tone: 'error', text: CAPTURE_FAILED_NOTICE }));
        }
        return null; // CANCELLED: người dùng đã rời màn, không hiển thị gì
      } finally {
        await restore();
        if (mounted.current) setStepIndex(-1);
      }
    },
    [capture, currentMode, restore, show],
  );

  const runAttempt = useCallback(
    async (notice: LivenessNotice | null): Promise<'done' | 'fallback'> => {
      show({ kind: 'preparing', notice });
      let challenge: LivenessChallenge;
      try {
        challenge = await requestLivenessChallenge();
      } catch (e) {
        applyRoute(routeChallengeError(e), null);
        return 'done';
      }
      if (!mounted.current) return 'done';
      setSteps(challenge.steps);

      if (!(await prepare(challenge))) {
        show(intro({ tone: 'error', text: CAMERA_NOT_READY_NOTICE }));
        return 'done';
      }

      await raise();
      for (let seconds = COUNTDOWN_SECONDS; seconds > 0; seconds -= 1) {
        show({ kind: 'countdown', seconds });
        await sleep(1000);
        if (!mounted.current) {
          await restore();
          return 'done';
        }
      }

      show({ kind: 'recording' });
      const captured = await record(challenge);
      if (captured === 'fallback') return 'fallback';
      if (!captured) return 'done';

      show({ kind: 'uploading' });
      const { submission, files } = toSubmission(challenge, captured);
      try {
        const result = await submitLiveness(submission);
        if (mounted.current) applyRoute(routeAfterLiveness(result), result);
      } catch (e) {
        show(intro({ tone: 'error', text: toUserMessage(e) }));
      } finally {
        // Video khuôn mặt là dữ liệu sinh trắc — không để lại trong cache sau khi đã gửi.
        files.forEach(discardTempFile);
      }
      return 'done';
    },
    [applyRoute, prepare, raise, record, restore, show],
  );

  const start = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      if ((await runAttempt(null)) === 'fallback' && mounted.current) {
        switchToStills();
        await runAttempt({ tone: 'warn', text: STILLS_FALLBACK_NOTICE });
      }
    } finally {
      running.current = false;
    }
  }, [runAttempt, switchToStills]);

  return { phase, steps, stepIndex, start, recorder };
}
