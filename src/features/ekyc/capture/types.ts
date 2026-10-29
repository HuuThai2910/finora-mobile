import type { ComponentType } from 'react';
import type { EkycCardSide, EkycImageSource, EkycQrMethod } from '@/types/ekyc';

/** Hai mặt CCCD phải chụp theo thứ tự trước → sau. */
export type CccdSide = 'front' | 'back';

export const SERVER_SIDE: Record<CccdSide, EkycCardSide> = { front: 'FRONT', back: 'BACK' };

export const toCccdSide = (side: EkycCardSide): CccdSide => (side === 'FRONT' ? 'front' : 'back');

/** Mã QR đọc được cho một mặt thẻ. */
export type CardQr = { text: string; method: EkycQrMethod };

/**
 * Một mặt thẻ đã sẵn sàng gửi đi: JPEG rộng tối đa 1600 px, nén một lần ở 0.9.
 * Chỉ sống trong bộ nhớ (EkycSession) — không ghi base64 xuống đĩa hay nhật ký.
 */
export type CardShot = {
  /** Ảnh đã xử lý trong cache, để xem lại tại chỗ. */
  uri: string;
  base64: string;
  width: number;
  height: number;
  source: EkycImageSource;
  qr: CardQr | null;
};

export type CaptureViewProps = {
  side: CccdSide;
  /** Màn đang hiển thị; tắt camera khi màn khác che lên để hai CameraView không tranh nhau. */
  active: boolean;
  /** Khoá thao tác khi màn đang gửi ảnh đi xác minh. */
  disabled: boolean;
  /**
   * Mặt còn lại đã có QR. Thẻ chỉ in QR ở một mặt (2021: trước, 2024: sau) nên khi đó bỏ
   * bước dò QR trên ảnh tĩnh của mặt này — trên Android bước đó tốn vài giây.
   */
  otherSideHasQr: boolean;
  onCaptured: (shot: CardShot) => void;
};

/**
 * Nguồn chụp CCCD thay thế được (phương án dự phòng về triển khai, không phải lựa chọn của
 * người dùng). Mỗi nguồn tự vẽ vùng chụp của mình và trả về `CardShot` đã xử lý chung
 * (`finalizeCardShot`), nên màn chụp, màn xem lại, upload và xử lý RETAKE không đổi khi đổi
 * nguồn. Chọn nguồn bằng `EXPO_PUBLIC_EKYC_CAPTURE_SOURCE` (xem `source.ts`).
 */
export interface CardCaptureSource {
  readonly kind: Exclude<EkycImageSource, 'GALLERY'>;
  readonly CaptureView: ComponentType<CaptureViewProps>;
}
