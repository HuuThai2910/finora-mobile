/**
 * Contract định danh điện tử — khớp `finora-user`:
 * `LivenessChallengeResponse`, `EkycVerifyRequest`, `EkycResultResponse`, `EkycResultCode`.
 *
 * Không thêm field nào backend không trả. Mọi giá trị ở đây là dữ liệu vận
 * chuyển; phần hiển thị (nhãn tiếng Việt, phần trăm) nằm ở lớp UI.
 */

/** Động tác server yêu cầu trong một phiên liveness. */
export type LivenessActionCode = 'blink' | 'turn_left' | 'turn_right';

/**
 * Thử thách cấp cho một lần xác minh.
 *
 * `sessionId` chỉ dùng được **một lần** và hết hạn sau `expiresInSeconds`;
 * đây là cơ chế chặn video quay sẵn nên client không được cache lại.
 */
export interface LivenessChallenge {
  sessionId: string;
  actions: LivenessActionCode[];
  expiresInSeconds: number;
}

/** Trạng thái eKYC bền vững của hồ sơ. */
export type EkycStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'MANUAL_REVIEW';

/** Lần gọi xác minh vừa rồi dừng ở bước nào. */
export type EkycResultCode =
  | 'VERIFIED'
  | 'PROFILE_NO_CCCD'
  | 'CHALLENGE_EXPIRED'
  | 'OCR_FAILED'
  | 'ID_MISMATCH'
  | 'LIVENESS_FAILED'
  | 'FACE_MISMATCH'
  | 'RATE_LIMITED'
  | 'AI_UNAVAILABLE';

export interface EkycVerifyRequest {
  sessionId: string;
  /** Các frame base64 theo đúng thứ tự thời gian. */
  frames: string[];
  /** Ảnh mặt trước CCCD, base64. */
  cccdImageBase64: string;
}

export interface EkycVerifyResult {
  status: EkycStatus;
  resultCode: EkycResultCode;
  faceMatch: boolean;
  /** Độ tương đồng khuôn mặt trong khoảng 0–1, đổi sang phần trăm lúc hiển thị. */
  faceMatchScore: number;
  livenessVerified: boolean;
  /** Trường mềm lệch so với hồ sơ (họ tên, ngày sinh) — không chặn xác minh. */
  ocrWarnings: string[];
  message: string;
}
