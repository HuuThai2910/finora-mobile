import type {
  EkycResultResponse,
  EkycVerifyRequest,
  LivenessReason,
} from '@/types/ekyc';
import { ApiError, toUserMessage } from '@/lib/api';
import { livenessReasonMessage, resultMessage } from '../constants/messages';
import type { CardShot } from '../capture/types';

type Nullable<T> = { [K in keyof T]?: T[K] | null };

/**
 * Khuôn `EkycResultResponse` trên dây: server có thể bỏ trường rỗng hoặc gửi `null` cho
 * mảng, nên mọi trường trừ hai mã bắt buộc đều có thể thiếu.
 */
export type EkycResultWire = Pick<EkycResultResponse, 'status' | 'resultCode'> &
  Nullable<Omit<EkycResultResponse, 'status' | 'resultCode' | 'liveness'>> & {
    liveness?: (Nullable<Omit<NonNullable<EkycResultResponse['liveness']>, 'result'>> & {
      result: NonNullable<EkycResultResponse['liveness']>['result'];
      reasons?: Nullable<LivenessReason>[] | null;
    }) | null;
  };

/** Điền giá trị rỗng mặc định để màn hình không phải kiểm `undefined`/`null` ở từng chỗ. */
export function normalizeEkycResult(raw: EkycResultWire): EkycResultResponse {
  const liveness = raw.liveness
    ? {
        result: raw.liveness.result,
        faceMatchScore: raw.liveness.faceMatchScore ?? null,
        reasons: (raw.liveness.reasons ?? []).map(r => ({ code: r.code ?? '', message: r.message ?? null })),
      }
    : null;

  return {
    status: raw.status,
    resultCode: raw.resultCode,
    message: raw.message ?? '',
    ocrWarnings: raw.ocrWarnings ?? [],
    cardType: raw.cardType ?? null,
    reviewRequired: raw.reviewRequired ?? false,
    retake: (raw.retake ?? []).map(item => ({ ...item, message: item.message ?? null })),
    draft: raw.draft ?? null,
    nextStep: raw.nextStep ?? 'NONE',
    attemptsLeft: raw.attemptsLeft ?? null,
    liveness,
  };
}

/** Ghép request quét thẻ; QR ưu tiên mặt trước (thẻ 2021), không có thì mặt sau (thẻ 2024). */
export function toVerifyRequest(front: CardShot, back: CardShot, consentVersion: string): EkycVerifyRequest {
  const qr = front.qr
    ? { text: front.qr.text, side: 'FRONT' as const, method: front.qr.method }
    : back.qr
      ? { text: back.qr.text, side: 'BACK' as const, method: back.qr.method }
      : null;

  return {
    cccdFrontBase64: front.base64,
    cccdBackBase64: back.base64,
    frontSource: front.source,
    backSource: back.source,
    qr,
    consentVersion,
  };
}

/** Bước tiếp theo sau khi quét thẻ. */
export type VerifyRoute = 'LIVENESS' | 'RETAKE' | 'RETRY_INLINE' | 'CONSENT' | 'RESULT';

export function routeAfterVerify(result: EkycResultResponse): VerifyRoute {
  switch (result.resultCode) {
    case 'DRAFT_READY':
      return 'LIVENESS';
    case 'RETAKE':
      return 'RETAKE';
    // Lỗi tạm thời: ảnh trong phiên vẫn dùng được, chỉ cần bấm gửi lại.
    case 'RATE_LIMITED':
    case 'AI_UNAVAILABLE':
    case 'STORAGE_UNAVAILABLE':
      return 'RETRY_INLINE';
    case 'CONSENT_REQUIRED':
      return 'CONSENT';
    default:
      // Thẻ hết hạn, CMND, dưới 18 tuổi, số đã dùng, đã xác minh, đang chờ duyệt, mã lạ...
      return 'RESULT';
  }
}

/** Kết quả là trạng thái cuối của hồ sơ — màn kết quả không cho quay lại các bước trước. */
export const isFinalOutcome = (result: EkycResultResponse): boolean =>
  result.resultCode === 'VERIFIED' || result.resultCode === 'REVIEW_PENDING';

/**
 * Lỗi 409 `REVIEW_PENDING` khi xin thử thách là trạng thái của hồ sơ chứ không phải sự cố:
 * dựng lại cùng khuôn kết quả để màn kết quả hiển thị "đang chờ duyệt" như mọi nhánh khác.
 */
export function pendingOutcome(message: string | null): EkycResultResponse {
  return {
    status: 'MANUAL_REVIEW',
    resultCode: 'REVIEW_PENDING',
    message: resultMessage('REVIEW_PENDING', message),
    ocrWarnings: [],
    cardType: null,
    reviewRequired: true,
    retake: [],
    draft: null,
    nextStep: 'NONE',
    attemptsLeft: null,
    liveness: null,
  };
}

/** Việc màn liveness phải làm sau một lần gửi video hoặc một lỗi khi xin thử thách. */
export type LivenessRoute =
  | { kind: 'REVIEW' }
  | { kind: 'FINAL'; outcome: EkycResultResponse }
  | { kind: 'RETRY'; tone: 'warn' | 'error'; message: string }
  | { kind: 'RESTART_CAPTURE'; message: string }
  | { kind: 'CONSENT'; message: string };

function livenessRetryMessage(result: EkycResultResponse): string {
  const reasons = (result.liveness?.reasons ?? [])
    .map(livenessReasonMessage)
    .filter((m): m is string => !!m);
  const base = reasons.length > 0 ? Array.from(new Set(reasons)).join('\n') : resultMessage(result.resultCode, result.message);
  const attempts = result.attemptsLeft;
  return attempts !== null && attempts > 0
    ? `${base}\nBạn còn ${attempts} lần thử trước khi hồ sơ chuyển sang duyệt thủ công.`
    : base;
}

export function routeAfterLiveness(result: EkycResultResponse): LivenessRoute {
  switch (result.resultCode) {
    case 'LIVENESS_PASSED':
    case 'LIVENESS_REVIEW':
      return { kind: 'REVIEW' };
    case 'REVIEW_PENDING':
    case 'VERIFIED':
      return { kind: 'FINAL', outcome: result };
    case 'RETAKE':
      return { kind: 'RETRY', tone: 'warn', message: livenessRetryMessage(result) };
    case 'LIVENESS_FAILED':
    case 'FACE_MISMATCH':
      return { kind: 'RETRY', tone: 'error', message: livenessRetryMessage(result) };
    case 'DRAFT_EXPIRED':
      return { kind: 'RESTART_CAPTURE', message: resultMessage(result.resultCode, result.message) };
    case 'CONSENT_REQUIRED':
      return { kind: 'CONSENT', message: resultMessage(result.resultCode, result.message) };
    default:
      // CHALLENGE_EXPIRED, RATE_LIMITED, AI_UNAVAILABLE, STORAGE_UNAVAILABLE, mã lạ: thử lại.
      return { kind: 'RETRY', tone: 'warn', message: resultMessage(result.resultCode, result.message) };
  }
}

/** Lỗi khi xin thử thách: server ném `BusinessException` với mã trong `code`. */
export function routeChallengeError(error: unknown): LivenessRoute {
  if (error instanceof ApiError) {
    const message = resultMessage(error.code, error.serverMessage);
    if (error.code === 'DRAFT_EXPIRED') return { kind: 'RESTART_CAPTURE', message };
    if (error.code === 'CONSENT_REQUIRED') return { kind: 'CONSENT', message };
    if (error.code === 'REVIEW_PENDING') return { kind: 'FINAL', outcome: pendingOutcome(error.serverMessage) };
  }
  return { kind: 'RETRY', tone: 'warn', message: toUserMessage(error) };
}
