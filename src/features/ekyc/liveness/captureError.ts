/**
 * Vì sao một lần quay liveness không ra được tệp để gửi:
 * - `VIDEO_UNSUPPORTED`: `recordAsync` lỗi hoặc không bao giờ trả tệp → chuyển sang chụp ảnh liên tiếp;
 * - `INTERRUPTED`: máy ngừng quay trước khi hết lịch (app xuống nền, camera bị chiếm) → quay lại;
 * - `NO_FRAMES`: chế độ ảnh liên tiếp chụp không đủ khung hình;
 * - `CANCELLED`: người dùng rời màn — không hiển thị gì.
 */
export type LivenessCaptureFailure = 'VIDEO_UNSUPPORTED' | 'INTERRUPTED' | 'NO_FRAMES' | 'CANCELLED';

export class LivenessCaptureError extends Error {
  readonly reason: LivenessCaptureFailure;

  constructor(reason: LivenessCaptureFailure) {
    super(`Liveness capture failed: ${reason}`);
    this.name = 'LivenessCaptureError';
    this.reason = reason;
  }
}
