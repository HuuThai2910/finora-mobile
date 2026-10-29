import type { VideoQuality } from 'expo-camera';
import type { IconName } from '@/constants/icons';
import type { LivenessAction, LivenessCaptureMode } from '@/types/ekyc';

/** Lời nhắc hiện trên màn trong lúc quay, theo đúng thứ tự `steps` server sinh. */
export const ACTION_PROMPT: Record<LivenessAction, string> = {
  FRONTAL: 'Nhìn thẳng',
  TURN_LEFT: 'Quay đầu sang trái',
  TURN_RIGHT: 'Quay đầu sang phải',
  LOOK_UP: 'Ngẩng lên',
  LOOK_DOWN: 'Cúi xuống',
};

/** Preview camera trước hiển thị như gương, nên "trái" của người dùng là mũi tên trái trên màn. */
export const ACTION_ICON: Record<LivenessAction, IconName> = {
  FRONTAL: 'scanFace',
  TURN_LEFT: 'chevronLeft',
  TURN_RIGHT: 'chevronRight',
  LOOK_UP: 'chevronUp',
  LOOK_DOWN: 'chevronDown',
};

/** Hành động lạ (server bổ sung sau) vẫn có lời nhắc thay vì màn trống. */
export const UNKNOWN_ACTION_PROMPT = 'Làm theo hướng dẫn';

export const LIVENESS_TIPS: readonly { icon: IconName; text: string }[] = [
  { icon: 'phone', text: 'Giữ điện thoại ngang tầm mắt, cách mặt khoảng một cánh tay.' },
  { icon: 'zap', text: 'Ngồi nơi đủ sáng, không quay lưng về phía cửa sổ hay bóng đèn.' },
  { icon: 'clock', text: 'Làm chậm và rõ từng động tác, giữ khoảng 1 giây ở mỗi tư thế.' },
  { icon: 'user', text: 'Chỉ mình bạn trong khung hình; bỏ kính râm và khẩu trang.' },
];

export const LIVENESS_PRIVACY_NOTE =
  'Video chỉ dùng để kiểm tra bạn là người thật và so với ảnh trên thẻ. Màn hình sẽ sáng lên ' +
  'trong lúc quay để chiếu sáng khuôn mặt.';

/**
 * Thông số video trước khi có thử thách — trùng giá trị server đang cấp (4:3 = 640×480,
 * 1,5 Mbps), nên thường không phải dựng lại camera khi thử thách về.
 */
export const DEFAULT_VIDEO_SETTINGS: { quality: VideoQuality; bitrate: number } = {
  quality: '4:3',
  bitrate: 1_500_000,
};

/**
 * Chế độ quay khi mở màn. `EXPO_PUBLIC_EKYC_LIVENESS_CAPTURE=stills` ép chụp ảnh liên tiếp để
 * thử nhánh dự phòng trên máy vẫn quay video bình thường; mặc định quay video.
 */
export const INITIAL_CAPTURE_MODE: LivenessCaptureMode =
  (process.env.EXPO_PUBLIC_EKYC_LIVENESS_CAPTURE ?? '').trim().toLowerCase() === 'stills'
    ? 'STILLS'
    : 'VIDEO';

/** Đếm ngược trước khi quay để người dùng kịp nhìn thẳng vào khung. */
export const COUNTDOWN_SECONDS = 3;

/** Quay thêm một chút sau bước cuối để server có đủ khung hình chính diện cuối video. */
export const STOP_PADDING_MS = 300;

/** Gọi `stopRecording` rồi mà quá khoảng này chưa có tệp video thì coi máy không quay được. */
export const FINALIZE_TIMEOUT_MS = 6000;

/** Chờ camera sẵn sàng sau khi dựng lại (đổi bitrate/chế độ). */
export const CAMERA_READY_TIMEOUT_MS = 6000;

/** Server giới hạn video 10 MB; đặt 8 MB để còn chỗ cho phần đầu multipart. */
export const MAX_VIDEO_BYTES = 8_000_000;

/** Chế độ ảnh liên tiếp: khoảng 1 khung/giây, thu về 640 px, tối đa 20 khung (giới hạn server). */
export const STILL_INTERVAL_MS = 1000;
export const STILL_WIDTH = 640;
export const STILL_QUALITY = 0.8;
export const MAX_STILL_FRAMES = 20;
/** Ít hơn số này thì server không đủ dữ liệu để chấm, không gửi lên. */
export const MIN_STILL_FRAMES = 3;

export const STILLS_FALLBACK_NOTICE =
  'Máy của bạn chưa quay được video, FINORA chuyển sang chụp ảnh liên tiếp. Hãy làm lại các ' +
  'động tác theo hướng dẫn; hồ sơ sẽ được duyệt thêm.';

export const INTERRUPTED_NOTICE = 'Quá trình quay bị gián đoạn. Giữ ứng dụng mở và thử lại.';

export const CAMERA_NOT_READY_NOTICE = 'Camera chưa sẵn sàng. Vui lòng thử lại.';
