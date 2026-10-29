import type { CameraView } from 'expo-camera';
import { File } from 'expo-file-system';
import { SaveFormat, manipulateAsync, type Action } from 'expo-image-manipulator';

/** Ảnh gốc vừa chụp hoặc vừa chọn, chưa nén lại — chỉ nằm trong thư mục cache. */
export type RawPhoto = { uri: string; width: number; height: number };

/** Vùng cắt tính theo pixel của ảnh gốc. */
export type CropRect = { originX: number; originY: number; width: number; height: number };

export type EncodedJpeg = { uri: string; width: number; height: number; base64: string | null };

type BurstOptions = {
  /** Số tấm tối đa. */
  shots: number;
  /** Quá khoảng này (tính từ lúc bấm) thì không chụp thêm, để người dùng không phải giữ máy lâu. */
  maxMs: number;
};

const describe = (e: unknown): string => (e instanceof Error ? e.message : 'lỗi không xác định');

/**
 * Chụp liên tiếp vài tấm ở chất lượng cao nhất rồi giữ tấm có tệp JPEG lớn nhất.
 *
 * Ảnh mờ ít chi tiết nên nén ra tệp nhỏ hơn — phép chọn kinh nghiệm, rẻ (không phải giải
 * mã ảnh) và đủ để loại tấm rung tay; server vẫn đo độ nét thật. Các tấm bị loại được xoá
 * ngay khỏi cache vì là ảnh giấy tờ.
 *
 * Trả `null` khi không tấm nào chụp được; lỗi của từng tấm chỉ ghi cảnh báo (không kèm
 * `uri`) để tấm sau vẫn chạy.
 */
export async function captureBurst(
  camera: CameraView | null,
  { shots, maxMs }: BurstOptions,
): Promise<RawPhoto | null> {
  if (!camera) return null;

  const startedAt = Date.now();
  const taken: (RawPhoto & { bytes: number })[] = [];

  for (let i = 0; i < shots; i += 1) {
    if (i > 0 && Date.now() - startedAt > maxMs) break;
    try {
      // quality 1: không nén ở bước chụp — ảnh chỉ được nén đúng một lần ở `encodeJpeg`.
      // Chỉ tấm đầu có tiếng màn trập để người dùng biết đã bấm, tránh ba tiếng liền nhau.
      const pic = await camera.takePictureAsync({ quality: 1, shutterSound: i === 0 });
      if (pic.uri) {
        taken.push({ uri: pic.uri, width: pic.width, height: pic.height, bytes: fileSizeOf(pic.uri) });
      }
    } catch (e) {
      console.warn('Chụp ảnh thất bại:', describe(e));
    }
  }

  if (taken.length === 0) return null;

  const best = taken.reduce((a, b) => (b.bytes > a.bytes ? b : a));
  taken.forEach(t => {
    if (t !== best) discardTempFile(t.uri);
  });
  return { uri: best.uri, width: best.width, height: best.height };
}

/**
 * Dải giữa ảnh tương ứng khung ngắm nằm ngang của màn chụp.
 *
 * Preview dùng chế độ cover và khớp chiều rộng, nên phần người dùng thấy là dải giữa cao
 * khoảng `width / aspect` của ảnh dọc. Nới thêm `expand` vì preview và ảnh chụp trên Android
 * có thể lệch tỉ lệ đôi chút — cắt sát quá dễ chém mất hàng chữ hay dòng MRZ ở mép thẻ.
 */
export function viewfinderBand(
  photo: { width: number; height: number },
  aspect: number,
  expand: number,
): CropRect {
  const height = Math.min(photo.height, Math.round((photo.width / aspect) * expand));
  return { originX: 0, originY: Math.round((photo.height - height) / 2), width: photo.width, height };
}

type EncodeOptions = {
  crop?: CropRect;
  /** Chiều rộng ảnh gốc; 0 khi hệ thống không báo — khi đó luôn thu về `maxWidth`. */
  sourceWidth: number;
  maxWidth: number;
  /** Mức nén JPEG 0–1. */
  quality: number;
  base64: boolean;
};

/**
 * Cắt, thu nhỏ và nén JPEG **một lần duy nhất** (nén nhiều lần làm chữ nhỏ trên thẻ nhoè
 * dần). Luôn xuất JPEG nên ảnh HEIC của iPhone (thư viện ảnh, camera hệ thống) cũng được đổi
 * sang JPEG — server chỉ nhận JPEG/PNG.
 *
 * Chỉ thu nhỏ khi ảnh rộng hơn đích: phóng to ảnh nhỏ chỉ làm chữ nhoè thêm.
 */
export async function encodeJpeg(
  uri: string,
  { crop, sourceWidth, maxWidth, quality, base64 }: EncodeOptions,
): Promise<EncodedJpeg> {
  const actions: Action[] = [];
  if (crop) actions.push({ crop });

  const width = crop ? crop.width : sourceWidth;
  if (!width || width > maxWidth) actions.push({ resize: { width: maxWidth } });

  const result = await manipulateAsync(uri, actions, {
    compress: quality,
    format: SaveFormat.JPEG,
    base64,
  });
  return { uri: result.uri, width: result.width, height: result.height, base64: result.base64 ?? null };
}

/** Kích thước tệp tính bằng byte; 0 khi không đọc được (ví dụ URI không phải tệp cục bộ). */
export function fileSizeOf(uri: string): number {
  if (!uri.startsWith('file:')) return 0;
  try {
    return new File(uri).size;
  } catch (e) {
    console.warn('Không đọc được kích thước tệp:', describe(e));
    return 0;
  }
}

/**
 * Xoá tệp tạm (ảnh giấy tờ, video khuôn mặt) ngay khi không còn cần, thay vì đợi hệ điều
 * hành dọn cache. Chỉ xoá tệp cục bộ `file:`; xoá lỗi chỉ ghi cảnh báo vì không ảnh hưởng
 * tới kết quả xác minh.
 */
export function discardTempFile(uri: string): void {
  if (!uri.startsWith('file:')) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn('Không xoá được tệp tạm:', describe(e));
  }
}

/**
 * Chọn pictureSize lớn nhất (nhưng không quá 12MP cho đỡ tốn thời gian xử lý)
 * từ danh sách máy hỗ trợ. Expo Go mặc định chụp ở độ phân giải khá thấp —
 * không ép chọn thì ảnh kém hơn hẳn app camera gốc và chữ trên thẻ khó đọc.
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
