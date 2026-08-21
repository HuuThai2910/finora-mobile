import type { CameraView } from 'expo-camera';
import { SaveFormat, manipulateAsync, type Action } from 'expo-image-manipulator';

/** Ảnh đã chụp: `uri` để xem lại tại chỗ, `base64` để gửi lên server. */
export type CapturedImage = { uri: string; base64: string };

type CaptureOptions = {
  /** Chiều rộng đích sau khi thu nhỏ, tính bằng pixel. Không bao giờ phóng to. */
  width: number;
  /** Mức nén JPEG 0–1. */
  quality: number;
  /**
   * Tỉ lệ khung ngắm (rộng/cao). Có giá trị thì cắt dải giữa ảnh theo vùng
   * khung ngắm hiển thị (preview dùng chế độ cover nên phần thấy được là dải
   * giữa của ảnh chụp). Không cắt thì vật trong khung chỉ chiếm một phần nhỏ
   * của ảnh, chữ bé đến mức OCR không đọc nổi.
   */
  cropAspect?: number;
  /**
   * Hệ số nới dải cắt (mặc định 1.3): preview và ảnh chụp trên Android có thể
   * lệch tỉ lệ đôi chút, cắt sát khung dễ chém mất hàng chữ trên/dưới của thẻ.
   */
  cropExpand?: number;
};

/**
 * Chụp một ảnh rồi (tuỳ chọn) cắt theo khung ngắm, thu nhỏ và mã hoá base64.
 *
 * Chỉ thu nhỏ khi ảnh lớn hơn đích: camera cho ảnh nhỏ mà phóng to lên chỉ làm
 * chữ mờ thêm. Không đặt `skipProcessing` để hệ thống tự xoay ảnh về đúng
 * chiều, nếu không ảnh chụp dọc trên Android sẽ nằm ngang và OCR đọc sai.
 *
 * Trả `null` khi không chụp được; bên gọi chịu trách nhiệm hiển thị thông báo.
 * Không log `uri` hay base64 — đó là ảnh giấy tờ và khuôn mặt.
 */
export async function captureBase64(
  camera: CameraView | null,
  { width, quality, cropAspect, cropExpand = 1.3 }: CaptureOptions,
): Promise<CapturedImage | null> {
  if (!camera) return null;

  try {
    const shot = await camera.takePictureAsync({ quality });
    if (!shot?.uri) return null;

    const actions: Action[] = [];
    let croppedWidth = shot.width;

    if (cropAspect && shot.width && shot.height) {
      // Preview cover khớp chiều rộng (ảnh dọc cao hơn khung ngắm ngang), nên
      // vùng nhìn thấy là dải giữa cao ~width / cropAspect, rộng nguyên ảnh.
      const cropHeight = Math.min(
        shot.height,
        Math.round((shot.width / cropAspect) * cropExpand),
      );
      actions.push({
        crop: {
          originX: 0,
          originY: Math.round((shot.height - cropHeight) / 2),
          width: shot.width,
          height: cropHeight,
        },
      });
    }

    if (!croppedWidth || croppedWidth > width) {
      actions.push({ resize: { width } });
    }

    const resized = await manipulateAsync(shot.uri, actions, {
      compress: quality,
      format: SaveFormat.JPEG,
      base64: true,
    });

    // Chỉ log kích thước (không log ảnh) — để đối chiếu với log `OCR CCCD: size=`
    // phía server khi chẩn đoán chất lượng chụp.
    console.log(
      `[camera] nguồn ${shot.width}x${shot.height} → gửi ${resized.width}x${resized.height}`,
    );

    return resized.base64 ? { uri: resized.uri, base64: resized.base64 } : null;
  } catch (e) {
    console.warn('Chụp ảnh thất bại:', e instanceof Error ? e.message : 'lỗi không xác định');
    return null;
  }
}

/**
 * Chọn pictureSize lớn nhất (nhưng không quá 12MP cho đỡ tốn thời gian xử lý)
 * từ danh sách máy hỗ trợ. Expo Go mặc định chụp ở độ phân giải khá thấp —
 * không ép chọn thì ảnh kém hơn hẳn app camera gốc và OCR không đọc nổi.
 *
 * Chỉ nhận chuỗi dạng "1920x1080"; nền tảng trả định dạng khác thì bỏ qua và
 * dùng mặc định của hệ thống.
 */
export function pickBestPictureSize(sizes: string[]): string | undefined {
  let best: { size: string; area: number } | undefined;
  let smallest: { size: string; area: number } | undefined;

  for (const raw of sizes) {
    const match = /^(\d+)x(\d+)$/.exec(raw.trim());
    if (!match) continue;
    const area = Number(match[1]) * Number(match[2]);

    if (!smallest || area < smallest.area) smallest = { size: raw, area };
    if (area > 12_000_000) continue;
    if (!best || area > best.area) best = { size: raw, area };
  }

  // Máy chỉ có toàn size khổng lồ thì đành lấy size nhỏ nhất trong số đó.
  return (best ?? smallest)?.size;
}
