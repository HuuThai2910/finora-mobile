import { Platform } from 'react-native';
import type { CccdSide } from '../capture/types';

/**
 * Ảnh CCCD gửi đi rộng tối đa 1600 px: đủ để Tesseract đọc dòng MRZ và để ảnh chân dung
 * trên thẻ có khoảng cách hai mắt đủ lớn cho bước so khuôn mặt.
 */
export const CCCD_WIDTH = 1600;

/** Nén JPEG đúng một lần ở mức này (chụp ở quality 1, không nén ở bước chụp). */
export const CCCD_QUALITY = 0.9;

/** Chiều cao khung ngắm CCCD — tia quét phải chạy đúng trong khoảng này. */
export const CCCD_FRAME_HEIGHT = 260;

/** Nới dải cắt theo khung ngắm, xem `viewfinderBand`. */
export const VIEWFINDER_CROP_EXPAND = 1.3;

/** Số tấm chụp liên tiếp mỗi lần bấm; giữ tấm có JPEG lớn nhất (ít mờ nhất). */
export const CARD_BURST_SHOTS = 3;

/** Không chụp thêm tấm mới sau khoảng này kể từ lúc bấm. */
export const CARD_BURST_MAX_MS = 2500;

/**
 * Lỗi expo-camera 57 trên Android: quét mã trong preview có thể đứng (đã sửa ở 58.0.9).
 * Chưa đọc được QR sau khoảng này kể từ lúc camera sẵn sàng thì dựng lại CameraView.
 */
export const QR_REMOUNT_AFTER_MS = 4000;

/** Số lần dựng lại tối đa cho một lần chụp — dựng lại liên tục làm preview nhấp nháy. */
export const QR_REMOUNT_LIMIT = 2;

/**
 * QR đọc sống chỉ được gắn vào ảnh nếu vừa thấy trong khoảng này trước lúc bấm chụp, để
 * không gắn nhầm QR của mặt kia khi người dùng lật thẻ trước khi chụp.
 */
export const LIVE_QR_FRESH_MS = 4000;

/** Ảnh cắt góc phần tư khi dò QR trên ảnh tĩnh (Android) — đủ nét mà không quá nặng. */
export const QR_SCAN_CROP_MAX_WIDTH = 2000;

/** Cùng một mặt bị yêu cầu chụp lại từng này lần liên tiếp thì cho chọn ảnh có sẵn. */
export const RETAKE_GALLERY_AFTER = 2;

export type ZoomPreset = { label: string; value: number };

/**
 * Preset phóng to để người dùng giữ máy cách thẻ ~20 cm (khoảng lấy nét được) mà thẻ vẫn
 * đầy khung. Hai nền tảng quy đổi `zoom` khác nhau nên giá trị khác nhau:
 * - Android (CameraX): tỉ lệ = max(1, zoom × maxZoom) — với maxZoom ≈ 8 thì 0.2 ≈ 1,6×,
 *   0.3 ≈ 2,4×; giá trị dưới 1/maxZoom không có tác dụng gì;
 * - iOS: tỉ lệ = maxZoom^zoom — với maxZoom 16 thì 0.1 ≈ 1,3×, 0.18 ≈ 1,65×.
 * Đây là giá trị tạm, phải hiệu chỉnh trên máy test thật.
 */
export const ZOOM_PRESETS: readonly ZoomPreset[] =
  Platform.OS === 'ios'
    ? [
        { label: 'Không', value: 0 },
        { label: 'Vừa', value: 0.1 },
        { label: 'Nhiều', value: 0.18 },
      ]
    : [
        { label: 'Không', value: 0 },
        { label: 'Vừa', value: 0.2 },
        { label: 'Nhiều', value: 0.3 },
      ];

/** Mặc định phóng vừa để người dùng không phải đưa máy sát thẻ (nguyên nhân mờ chính). */
export const DEFAULT_ZOOM_INDEX = 1;

/** Tiêu đề và phụ đề màn chụp theo mặt thẻ. */
export const CAPTURE_TITLE: Record<CccdSide, string> = {
  front: 'Chụp mặt trước CCCD',
  back: 'Chụp mặt sau CCCD',
};

export const CAPTURE_SUB: Record<CccdSide, string> = {
  front: 'Mặt có ảnh chân dung, thẻ nằm gọn trong khung',
  back: 'Mặt có 3 dòng ký tự ở cuối thẻ, thẻ nằm gọn trong khung',
};

export const DISTANCE_HINT =
  'Đặt thẻ trên mặt phẳng, đủ sáng, không loá. Giữ máy cách thẻ khoảng 20 cm — thẻ nhỏ thì ' +
  'chọn phóng to thay vì đưa máy lại gần.';

/** Hướng dẫn trước khi mở app Camera của máy (nguồn `system`). */
export const SYSTEM_CAPTURE_TIPS: readonly string[] = [
  'Đặt thẻ trên mặt phẳng tối màu, chụp thẳng từ trên xuống.',
  'Thấy đủ 4 góc thẻ, không để ngón tay che chữ hay mã QR.',
  'Giữ máy cách thẻ khoảng 20 cm, chạm vào thẻ trên màn hình để lấy nét rồi mới chụp.',
  'Tránh đèn chiếu thẳng gây loá; tắt đèn flash.',
];

/** Bốn bước của luồng định danh, hiển thị trên thanh tiến độ đầu các màn. */
export const EKYC_STEP_TOTAL = 4;

export const EKYC_STEP_LABEL = {
  front: 'Chụp mặt trước',
  back: 'Chụp mặt sau',
  liveness: 'Kiểm tra khuôn mặt',
  review: 'Soát và xác nhận',
} as const;
