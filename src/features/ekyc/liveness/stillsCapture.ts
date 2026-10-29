import type { CameraView } from 'expo-camera';
import { discardTempFile, encodeJpeg } from '@/lib/camera';
import type { LivenessChallenge, UploadFile } from '@/types/ekyc';
import {
  MAX_STILL_FRAMES,
  MIN_STILL_FRAMES,
  STILL_INTERVAL_MS,
  STILL_QUALITY,
  STILL_WIDTH,
} from '../constants/liveness';
import { LivenessCaptureError } from './captureError';
import { runSchedule, waitUntil } from './schedule';

const describe = (e: unknown): string => (e instanceof Error ? e.message : 'lỗi không xác định');

export type StillsCapture = { frames: UploadFile[]; frameTimesMs: number[] };

/**
 * Chế độ dự phòng khi máy không quay được video: chụp khoảng 1 khung/giây suốt lịch nhắc.
 * CameraView phải ở `mode="picture"` (Android chỉ gắn bộ chụp ảnh ở chế độ này).
 *
 * Ảnh được chụp nhanh trong lúc chạy lịch, chỉ thu nhỏ về 640 px sau khi chụp xong để nhịp
 * chụp không bị chậm bởi bước nén. `frameTimesMs` là thời điểm bấm chụp tính từ đầu lịch nhắc,
 * cùng thứ tự với `frames` — server dùng để đối chiếu động tác với lịch. Server chỉ cho kết quả
 * tối đa "chờ duyệt" ở chế độ này.
 */
export async function captureChallengeStills(
  camera: CameraView,
  challenge: LivenessChallenge,
  onStep: (index: number) => void,
  cancelled: () => boolean,
): Promise<StillsCapture> {
  const raw: { uri: string; width: number; atMs: number }[] = [];
  let scheduleDone = false;
  const startedAt = Date.now();
  const schedule = runSchedule(challenge.steps, onStep, cancelled).then(ok => {
    scheduleDone = true;
    return ok;
  });

  while (!scheduleDone && !cancelled() && raw.length < MAX_STILL_FRAMES) {
    const atMs = Date.now() - startedAt;
    try {
      const pic = await camera.takePictureAsync({ quality: 1, shutterSound: false });
      if (pic.uri) raw.push({ uri: pic.uri, width: pic.width, atMs });
    } catch (e) {
      console.warn('Chụp khung hình liveness thất bại:', describe(e));
    }
    await waitUntil(startedAt + atMs + STILL_INTERVAL_MS, () => scheduleDone || cancelled());
  }

  const completed = await schedule;
  const discardRaw = () => raw.forEach(r => discardTempFile(r.uri));
  if (!completed || cancelled()) {
    discardRaw();
    throw new LivenessCaptureError('CANCELLED');
  }
  if (raw.length < MIN_STILL_FRAMES) {
    discardRaw();
    throw new LivenessCaptureError('NO_FRAMES');
  }

  const frames: UploadFile[] = [];
  const frameTimesMs: number[] = [];
  try {
    for (const [index, shot] of raw.entries()) {
      const small = await encodeJpeg(shot.uri, {
        sourceWidth: shot.width,
        maxWidth: STILL_WIDTH,
        quality: STILL_QUALITY,
        base64: false,
      });
      frames.push({ uri: small.uri, name: `frame-${index + 1}.jpg`, type: 'image/jpeg' });
      frameTimesMs.push(shot.atMs);
    }
  } catch (e) {
    frames.forEach(f => discardTempFile(f.uri));
    throw e;
  } finally {
    discardRaw();
  }
  return { frames, frameTimesMs };
}
