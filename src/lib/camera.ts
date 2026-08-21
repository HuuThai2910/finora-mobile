import type { CameraView } from 'expo-camera';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';

/** Ảnh đã chụp: `uri` để xem lại tại chỗ, `base64` để gửi lên server. */
export type CapturedImage = { uri: string; base64: string };

type CaptureOptions = {
  /** Chiều rộng đích sau khi thu nhỏ, tính bằng pixel. */
  width: number;
  /** Mức nén JPEG 0–1. */
  quality: number;
};

/**
 * Chụp một ảnh rồi thu nhỏ và mã hoá base64.
 *
 * Luôn thu nhỏ trước khi mã hoá: camera điện thoại cho ảnh 8–12MP, chuyển
 * thẳng sang base64 sẽ ra chuỗi vài MB — đủ để nghẽn request và làm server từ
 * chối. Không đặt `skipProcessing` để hệ thống tự xoay ảnh về đúng chiều, nếu
 * không ảnh chụp dọc trên Android sẽ nằm ngang và OCR đọc sai.
 *
 * Trả `null` khi không chụp được; bên gọi chịu trách nhiệm hiển thị thông báo.
 * Không log `uri` hay base64 — đó là ảnh giấy tờ và khuôn mặt.
 */
export async function captureBase64(
  camera: CameraView | null,
  { width, quality }: CaptureOptions,
): Promise<CapturedImage | null> {
  if (!camera) return null;

  try {
    const shot = await camera.takePictureAsync({ quality });
    if (!shot?.uri) return null;

    const resized = await manipulateAsync(
      shot.uri,
      [{ resize: { width } }],
      { compress: quality, format: SaveFormat.JPEG, base64: true },
    );

    return resized.base64 ? { uri: resized.uri, base64: resized.base64 } : null;
  } catch (e) {
    console.warn('Chụp ảnh thất bại:', e instanceof Error ? e.message : 'lỗi không xác định');
    return null;
  }
}
