/**
 * Contract định danh điện tử — khớp `finora-user`:
 * `EkycVerifyRequest`, `EkycResultResponse`, `EkycResultCode`.
 *
 * Luồng đã bỏ xác minh khuôn mặt/liveness: bằng chứng định danh là ảnh hai mặt
 * CCCD. Không thêm field nào backend không trả; phần hiển thị (nhãn tiếng Việt)
 * nằm ở lớp UI.
 */

/** Trạng thái eKYC bền vững của hồ sơ. */
export type EkycStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'MANUAL_REVIEW';

/** Lần gọi eKYC vừa rồi dừng ở bước nào. */
export type EkycResultCode =
  | 'DRAFT_READY'
  | 'DRAFT_EXPIRED'
  | 'VERIFIED'
  | 'OCR_FAILED'
  | 'ID_MISMATCH'
  | 'ID_TAKEN'
  | 'RATE_LIMITED'
  | 'AI_UNAVAILABLE';

export interface EkycVerifyRequest {
  /** Ảnh mặt trước CCCD, base64 — backend OCR mặt này. */
  cccdFrontBase64: string;
  /** Ảnh mặt sau CCCD, base64 — bằng chứng cầm thẻ đầy đủ, không OCR. */
  cccdBackBase64: string;
}

/** Bản nháp thông tin OCR đọc được — hiển thị nguyên văn cho người dùng soát. */
export interface EkycDraft {
  idNumber: string;
  fullName: string | null;
  /** Giữ dạng chuỗi như in trên thẻ (dd/mm/yyyy). */
  dateOfBirth: string | null;
  gender: string | null;
  placeOfOrigin: string | null;
  address: string | null;
}

export interface EkycVerifyResult {
  status: EkycStatus;
  resultCode: EkycResultCode;
  /** Trường mềm lệch so với hồ sơ (họ tên, ngày sinh) — không chặn xác minh. */
  ocrWarnings: string[];
  message: string;
  /** Chỉ có khi `resultCode === 'DRAFT_READY'` — hồ sơ chưa lưu gì ở bước này. */
  draft: EkycDraft | null;
}
