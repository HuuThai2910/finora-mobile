import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraView, VideoQuality } from 'expo-camera';
import type { LivenessCaptureMode, LivenessChallenge, UploadFile } from '@/types/ekyc';
import { CAMERA_READY_TIMEOUT_MS, DEFAULT_VIDEO_SETTINGS, INITIAL_CAPTURE_MODE } from '../constants/liveness';
import { LivenessCaptureError } from '../liveness/captureError';
import { captureChallengeStills, type StillsCapture } from '../liveness/stillsCapture';
import { recordChallengeVideo } from '../liveness/videoCapture';

export type VideoSettings = { quality: VideoQuality; bitrate: number };

/** Kết quả một lần quay: tệp video, hoặc loạt ảnh khi đang ở chế độ dự phòng. */
export type CapturedLiveness = { mode: 'VIDEO'; video: UploadFile } | ({ mode: 'STILLS' } & StillsCapture);

const VIDEO_QUALITIES: readonly VideoQuality[] = ['2160p', '1080p', '720p', '480p', '4:3'];

/** Thông số video của thử thách; giá trị lạ thì giữ mặc định thay vì truyền chuỗi sai cho camera. */
function toVideoSettings(challenge: LivenessChallenge): VideoSettings {
  const quality = VIDEO_QUALITIES.find(q => q === challenge.video.quality) ?? DEFAULT_VIDEO_SETTINGS.quality;
  const bitrate = challenge.video.bitrate > 0 ? challenge.video.bitrate : DEFAULT_VIDEO_SETTINGS.bitrate;
  return { quality, bitrate };
}

/**
 * Phần cơ khí của camera trước cho bước liveness: giữ `CameraView` (khoá dựng lại, chế độ
 * video/ảnh, thông số video), biết khi nào camera sẵn sàng, và chạy một lần quay theo thử thách.
 *
 * - Đổi `videoBitrate`/`videoQuality` hay chế độ làm Android dựng lại camera, nên mỗi lần đổi
 *   đều đổi `cameraKey` (dựng lại trên cả hai nền tảng) rồi chờ `onCameraReady` mới quay —
 *   `recordAsync` gọi khi camera chưa gắn xong sẽ lỗi ngay.
 * - Chế độ ảnh liên tiếp (`STILLS`) dùng `mode="picture"` vì Android chỉ gắn bộ chụp ảnh ở chế
 *   độ đó; đã rơi về STILLS thì giữ cho các lần thử sau trên màn này.
 * - Rời màn: đặt cờ huỷ để lịch nhắc dừng và tệp dở bị xoá.
 */
export function useLivenessRecorder() {
  const cameraRef = useRef<CameraView>(null);
  const [cameraKey, setCameraKey] = useState(0);
  const [mode, setModeState] = useState<LivenessCaptureMode>(INITIAL_CAPTURE_MODE);
  const [video, setVideo] = useState<VideoSettings>(DEFAULT_VIDEO_SETTINGS);
  // Bản sao trong ref để các bước async dài đọc được giá trị mới nhất mà không phụ thuộc render.
  const modeRef = useRef(mode);
  const videoRef = useRef(video);
  const ready = useRef(false);
  const waiters = useRef<(() => void)[]>([]);
  const cancelled = useRef(false);

  const onCameraReady = useCallback(() => {
    ready.current = true;
    const pending = waiters.current;
    waiters.current = [];
    pending.forEach(notify => notify());
  }, []);

  const remount = useCallback(() => {
    ready.current = false;
    setCameraKey(k => k + 1);
  }, []);

  const waitUntilReady = useCallback(
    () =>
      new Promise<boolean>(resolve => {
        if (ready.current) {
          resolve(true);
          return;
        }
        const notify = () => {
          clearTimeout(timer);
          resolve(true);
        };
        const timer = setTimeout(() => {
          waiters.current = waiters.current.filter(w => w !== notify);
          resolve(false);
        }, CAMERA_READY_TIMEOUT_MS);
        waiters.current.push(notify);
      }),
    [],
  );

  /** Áp thông số của thử thách (dựng lại camera nếu khác) rồi chờ camera sẵn sàng. */
  const prepare = useCallback(
    async (challenge: LivenessChallenge): Promise<boolean> => {
      cancelled.current = false;
      const next = toVideoSettings(challenge);
      const current = videoRef.current;
      if (modeRef.current === 'VIDEO' && (next.quality !== current.quality || next.bitrate !== current.bitrate)) {
        videoRef.current = next;
        setVideo(next);
        remount();
      }
      return waitUntilReady();
    },
    [remount, waitUntilReady],
  );

  const switchToStills = useCallback(() => {
    modeRef.current = 'STILLS';
    setModeState('STILLS');
    remount();
  }, [remount]);

  /** Quay theo chế độ hiện tại; ném `LivenessCaptureError` khi không ra được tệp. */
  const capture = useCallback(
    async (challenge: LivenessChallenge, onStep: (index: number) => void): Promise<CapturedLiveness> => {
      const camera = cameraRef.current;
      if (!camera) throw new LivenessCaptureError('VIDEO_UNSUPPORTED');
      const isCancelled = () => cancelled.current;
      if (modeRef.current === 'STILLS') {
        return { mode: 'STILLS', ...(await captureChallengeStills(camera, challenge, onStep, isCancelled)) };
      }
      return { mode: 'VIDEO', video: await recordChallengeVideo(camera, challenge, onStep, isCancelled) };
    },
    [],
  );

  const currentMode = useCallback((): LivenessCaptureMode => modeRef.current, []);

  /** Màn bị che và camera bị gỡ: lần quay sau phải chờ camera dựng lại báo sẵn sàng. */
  const markNotReady = useCallback(() => {
    ready.current = false;
  }, []);

  // Rời màn giữa lúc quay: dừng lịch nhắc và vòng chụp; camera tự giải phóng khi view bị gỡ.
  useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );

  return {
    cameraRef,
    cameraKey,
    mode,
    video,
    onCameraReady,
    prepare,
    capture,
    switchToStills,
    currentMode,
    markNotReady,
  };
}
