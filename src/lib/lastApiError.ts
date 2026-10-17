/**
 * Mã lỗi API gần nhất người dùng gặp trong lần chạy app này.
 *
 * Trợ lý FINORA gửi mã này trong `context.lastErrorCode` để trả lời đúng câu "vì sao tôi không làm
 * được?" ngay sau khi gặp lỗi (ví dụ `PIN_LOCKED`, `SELF_TRADE_PREVENTED`) mà người dùng không phải
 * chép mã. Chỉ giữ mã, không giữ thông điệp hay body, để không mang dữ liệu cá nhân sang trợ lý.
 * Không ghi xuống đĩa: tắt app là mất, đúng ý "lỗi vừa gặp".
 */

/** Lỗi cũ hơn 10 phút coi như không còn liên quan tới câu đang hỏi. */
const MAX_AGE_MS = 10 * 60 * 1000;

/** Cùng khuôn mã lỗi của backend (`PIN_LOCKED`, `CORE_LENDING_UNAVAILABLE`), tối đa 80 ký tự như server nhận. */
const ERROR_CODE = /^[A-Z][A-Z0-9_]{1,79}$/;

/**
 * Mã không giúp giải thích nghiệp vụ: `UNKNOWN`/`VALIDATION_ERROR` do chính `api.ts` đặt khi body
 * không có mã, `MOCK_FAILURE` của dữ liệu giả, lỗi của trợ lý và lỗi xác thực.
 */
const IGNORED = new Set(['UNKNOWN', 'VALIDATION_ERROR', 'MOCK_FAILURE']);
const IGNORED_PREFIXES = ['ASSISTANT_', 'AUTH_'];

let last: { code: string; at: number } | null = null;

export function recordApiError(code: string, now: number = Date.now()): void {
  if (!ERROR_CODE.test(code) || IGNORED.has(code)) return;
  if (IGNORED_PREFIXES.some(prefix => code.startsWith(prefix))) return;
  last = { code, at: now };
}

export function getLastApiErrorCode(now: number = Date.now()): string | null {
  if (!last || now - last.at > MAX_AGE_MS) return null;
  return last.code;
}

export function clearLastApiError(): void {
  last = null;
}
