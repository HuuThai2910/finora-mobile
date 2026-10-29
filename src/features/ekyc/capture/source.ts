import { inAppCameraSource } from './inAppCameraSource';
import { systemCameraSource } from './systemCameraSource';
import type { CardCaptureSource } from './types';

/**
 * Nguồn chụp CCCD dùng cho cả app, chọn bằng cấu hình chứ không bằng nút bấm (Hải chốt
 * 16/10): `EXPO_PUBLIC_EKYC_CAPTURE_SOURCE=in_app|system`, mặc định `in_app`. Đổi nguồn chỉ
 * cần sửa biến này và chạy lại `expo start`; giá trị lạ rơi về mặc định.
 */
const configured = (process.env.EXPO_PUBLIC_EKYC_CAPTURE_SOURCE ?? '').trim().toLowerCase();

export const cardCaptureSource: CardCaptureSource =
  configured === 'system' ? systemCameraSource : inAppCameraSource;
