import {
  SIGNATURE_IN_PROGRESS_CODE,
  SIGNATURE_IN_PROGRESS_MESSAGE,
  SIGNATURE_REJECTED_CODE,
  SIGNATURE_REJECTED_MESSAGE,
} from '@/constants/contractSignature';
import { ApiError, toUserMessage } from '@/lib/api';

/** Chữ ký bị từ chối: backend đã hủy lần ký và trả phần vốn của nhà đầu tư về chờ ký (W3C). */
export const isSignatureRejected = (error: unknown): boolean =>
  error instanceof ApiError && error.code === SIGNATURE_REJECTED_CODE;

/**
 * Lỗi kết thúc phiên ký SmartCA: hỏi tiếp cũng không đổi gì (B72). Gồm chữ ký bị từ chối và lỗi nghiệp vụ 4xx, ví dụ
 * `INVESTOR_SIGNATURE_NOT_STARTED` khi worker đã đóng phiên quá hạn.
 */
export const endsSigningSession = (error: unknown): boolean =>
  isSignatureRejected(error) || (error instanceof ApiError && error.isBusinessError);

export type SignFailure = {
  message: string;
  /** Lần ký đã bị backend hủy hẳn: lần bấm sau là lần ký mới (key mới) và màn phải tải lại hợp đồng. */
  attemptClosed: boolean;
};

/**
 * Lỗi của `POST /sign` sang câu hiển thị và việc màn phải làm (D74). `409 CONTRACT_SIGNATURE_IN_PROGRESS`: nhà đầu
 * tư khác đang có phiên ký chờ, không có gì được ghi cho lần bấm này nên giữ nguyên ý định (key cũ) và không tự thử
 * lại; người dùng bấm lại sau vài phút.
 */
export function toSignFailure(error: unknown): SignFailure {
  if (isSignatureRejected(error)) return { message: SIGNATURE_REJECTED_MESSAGE, attemptClosed: true };
  if (error instanceof ApiError && error.code === SIGNATURE_IN_PROGRESS_CODE) {
    return { message: SIGNATURE_IN_PROGRESS_MESSAGE, attemptClosed: false };
  }
  return { message: toUserMessage(error), attemptClosed: false };
}
