import { Platform } from 'react-native';
import type { CameraRecordingOptions, CameraView } from 'expo-camera';
import { discardTempFile } from '@/lib/camera';
import type { LivenessChallenge, UploadFile } from '@/types/ekyc';
import { FINALIZE_TIMEOUT_MS, MAX_VIDEO_BYTES, STOP_PADDING_MS } from '../constants/liveness';
import { LivenessCaptureError } from './captureError';
import { runSchedule, sleep } from './schedule';

const describe = (e: unknown): string => (e instanceof Error ? e.message : 'lỗi không xác định');

function recordingOptions(challenge: LivenessChallenge): CameraRecordingOptions {
  const base: CameraRecordingOptions = {
    // Lưới an toàn nếu lệnh dừng không tới được máy: tự dừng sau thời lượng tối đa server cho.
    maxDuration: challenge.maxDurationSec,
    maxFileSize: MAX_VIDEO_BYTES,
  };
  // iOS: codec avc1 (H.264) để server giải mã bằng OpenCV, và iOS chỉ áp `videoBitrate` khi có
  // codec. Android không có tham số codec — CameraX tự ghi H.264 trong MP4.
  return Platform.OS === 'ios' ? { ...base, codec: 'avc1' } : base;
}

/** Tên và kiểu tệp theo đuôi thật: Android ghi `.mp4`, iOS ghi `.mov`. */
function videoFile(uri: string): UploadFile {
  const mov = uri.toLowerCase().endsWith('.mov');
  return { uri, name: mov ? 'liveness.mov' : 'liveness.mp4', type: mov ? 'video/quicktime' : 'video/mp4' };
}

/** Chờ promise xong trong `ms`; trả `false` nếu quá hạn. */
async function settleWithin(promise: Promise<void>, ms: number): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<boolean>(resolve => {
    timer = setTimeout(() => resolve(false), ms);
  });
  const settled = await Promise.race([promise.then(() => true), timeout]);
  clearTimeout(timer);
  return settled;
}

/**
 * Quay một video theo đúng lịch nhắc của thử thách rồi trả tệp để upload.
 *
 * `recordAsync` chỉ trả kết quả khi việc quay kết thúc, nên lịch nhắc chạy song song và dừng
 * ghi sau tổng thời gian giữ + ~300 ms. Phân loại thất bại để màn hình chọn đường lui:
 * - `recordAsync` lỗi, không trả tệp, hoặc quá hạn chờ sau khi dừng → `VIDEO_UNSUPPORTED`
 *   (chuyển sang chụp ảnh liên tiếp);
 * - máy tự ngừng quay trước khi hết lịch (app xuống nền...) → `INTERRUPTED`;
 * - người dùng rời màn → `CANCELLED`.
 * Tệp dở dang luôn bị xoá khỏi cache.
 */
export async function recordChallengeVideo(
  camera: CameraView,
  challenge: LivenessChallenge,
  onStep: (index: number) => void,
  cancelled: () => boolean,
): Promise<UploadFile> {
  const outcome: { settled: boolean; failed: boolean; uri: string | null } = {
    settled: false,
    failed: false,
    uri: null,
  };
  const recording = camera.recordAsync(recordingOptions(challenge)).then(
    result => {
      outcome.settled = true;
      outcome.uri = result?.uri ?? null;
    },
    (e: unknown) => {
      outcome.settled = true;
      outcome.failed = true;
      console.warn('Quay video liveness thất bại:', describe(e));
    },
  );

  const completed = await runSchedule(challenge.steps, onStep, () => outcome.settled || cancelled());

  if (completed) {
    await sleep(STOP_PADDING_MS);
  }
  camera.stopRecording();
  const finished = await settleWithin(recording, FINALIZE_TIMEOUT_MS);
  const uri = outcome.uri;

  if (completed && finished && !outcome.failed && uri && !cancelled()) {
    return videoFile(uri);
  }

  // Bỏ tệp dở; nếu máy trả tệp muộn sau khi đã quá hạn chờ thì xoá lúc tệp tới.
  if (uri) discardTempFile(uri);
  if (!finished) {
    void recording.then(() => {
      if (outcome.uri) discardTempFile(outcome.uri);
    });
  }

  if (cancelled()) throw new LivenessCaptureError('CANCELLED');
  if (!finished || outcome.failed || !uri) throw new LivenessCaptureError('VIDEO_UNSUPPORTED');
  throw new LivenessCaptureError('INTERRUPTED');
}
