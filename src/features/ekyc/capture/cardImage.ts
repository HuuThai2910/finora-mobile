import { discardTempFile, encodeJpeg, viewfinderBand, type CropRect, type RawPhoto } from '@/lib/camera';
import type { EkycImageSource } from '@/types/ekyc';
import { CCCD_QUALITY, CCCD_WIDTH, VIEWFINDER_CROP_EXPAND } from '../constants/capture';
import { scanCccdQrInPhoto } from './qrScan';
import type { CardQr, CardShot } from './types';

type FinalizeOptions = {
  source: EkycImageSource;
  /** QR vừa đọc sống trên khung ngắm (còn "tươi"), nếu có. */
  liveQr: string | null;
  /** Mặt kia đã có QR thì khỏi dò QR trên ảnh tĩnh của mặt này. */
  skipStillScan: boolean;
  /** Tỉ lệ khung ngắm — chỉ camera trong app mới cắt theo khung. */
  cropAspect?: number;
};

/**
 * Phần xử lý chung cho mọi nguồn ảnh (camera trong app, camera hệ thống, thư viện):
 * 1. chưa có QR thì dò trên **ảnh gốc** độ phân giải đầy đủ (trước khi thu nhỏ);
 * 2. cắt theo khung ngắm (nếu có), thu về ≤ 1600 px, đổi sang JPEG và nén **một lần** 0.9;
 * 3. xoá ảnh gốc khỏi cache.
 *
 * Ném lỗi khi không mã hoá được ảnh — bên gọi hiển thị thông báo và cho chụp lại.
 */
export async function finalizeCardShot(raw: RawPhoto, options: FinalizeOptions): Promise<CardShot> {
  const { source, liveQr, skipStillScan, cropAspect } = options;
  const crop = cropAspect && raw.width && raw.height
    ? viewfinderBand(raw, cropAspect, VIEWFINDER_CROP_EXPAND)
    : undefined;

  try {
    let qr: CardQr | null = liveQr ? { text: liveQr, method: 'LIVE_SCAN' } : null;
    if (!qr && !skipStillScan) {
      const region: CropRect = crop ?? { originX: 0, originY: 0, width: raw.width, height: raw.height };
      const text = await scanCccdQrInPhoto(raw.uri, region);
      if (text) qr = { text, method: 'STILL_SCAN' };
    }

    const jpeg = await encodeJpeg(raw.uri, {
      crop,
      sourceWidth: raw.width,
      maxWidth: CCCD_WIDTH,
      quality: CCCD_QUALITY,
      base64: true,
    });
    if (!jpeg.base64) throw new Error('Không mã hoá được ảnh thẻ');

    return {
      uri: jpeg.uri,
      base64: jpeg.base64,
      width: jpeg.width,
      height: jpeg.height,
      source,
      qr,
    };
  } finally {
    discardTempFile(raw.uri);
  }
}
