import { Platform } from 'react-native';
import { scanFromURLAsync } from 'expo-camera';
import { discardTempFile, encodeJpeg, type CropRect } from '@/lib/camera';
import { QR_SCAN_CROP_MAX_WIDTH } from '../constants/capture';

/**
 * QR trên CCCD/Căn cước bắt đầu bằng 12 số định danh rồi dấu `|`
 * (`ID12|CMND9|Họ tên|ddmmyyyy|Giới tính|Địa chỉ|ddmmyyyy`). Mã QR khác lọt vào khung
 * (mã thanh toán, link...) bị bỏ qua.
 */
const CCCD_QR_PATTERN = /^\d{12}\|/;

export const isCccdQr = (text: string): boolean => CCCD_QR_PATTERN.test(text);

const describe = (e: unknown): string => (e instanceof Error ? e.message : 'lỗi không xác định');

/** Không log nội dung QR — đó là họ tên, ngày sinh, địa chỉ của người dùng. */
async function scanOnce(uri: string): Promise<string | null> {
  try {
    const results = await scanFromURLAsync(uri, ['qr']);
    return results.map(r => r.data).find(isCccdQr) ?? null;
  } catch (e) {
    console.warn('Dò QR trên ảnh thất bại:', describe(e));
    return null;
  }
}

/**
 * Bốn góc phần tư, chồng lên nhau 10% để mã nằm ngay đường chia vẫn còn nguyên ở một ô.
 */
function quadrants(region: CropRect): CropRect[] {
  const width = Math.round(region.width * 0.55);
  const height = Math.round(region.height * 0.55);
  const right = region.originX + region.width - width;
  const bottom = region.originY + region.height - height;
  return [
    { originX: region.originX, originY: region.originY, width, height },
    { originX: right, originY: region.originY, width, height },
    { originX: region.originX, originY: bottom, width, height },
    { originX: right, originY: bottom, width, height },
  ];
}

/**
 * Dò QR CCCD trên ảnh gốc độ phân giải đầy đủ — đường lui khi quét sống trên khung ngắm
 * chưa kịp đọc được mã.
 *
 * Android (ML Kit) chỉ đọc tốt khi mã chiếm phần lớn ảnh, nên nếu cả ảnh không ra thì thử
 * thêm 4 góc phần tư của vùng thẻ; iOS đọc được mã nhỏ trên ảnh lớn nên chỉ thử một lần.
 * Các ảnh cắt tạm được xoá ngay sau khi dò.
 */
export async function scanCccdQrInPhoto(uri: string, region: CropRect): Promise<string | null> {
  const whole = await scanOnce(uri);
  // Không biết kích thước ảnh (vài nguồn thư viện báo 0) thì không cắt được góc phần tư.
  if (whole || Platform.OS !== 'android' || region.width <= 0 || region.height <= 0) return whole;

  for (const crop of quadrants(region)) {
    let cropUri: string | null = null;
    try {
      const piece = await encodeJpeg(uri, {
        crop,
        sourceWidth: region.width,
        maxWidth: QR_SCAN_CROP_MAX_WIDTH,
        quality: 0.95,
        base64: false,
      });
      cropUri = piece.uri;
      const text = await scanOnce(piece.uri);
      if (text) return text;
    } catch (e) {
      console.warn('Cắt ảnh để dò QR thất bại:', describe(e));
    } finally {
      if (cropUri) discardTempFile(cropUri);
    }
  }
  return null;
}
