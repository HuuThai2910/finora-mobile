import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  SIGNATURE_IN_PROGRESS_CODE,
  SIGNATURE_IN_PROGRESS_MESSAGE,
  SIGNATURE_REJECTED_CODE,
  SIGNATURE_REJECTED_MESSAGE,
} from '@/constants/contractSignature';

export type ActionError = {
  message: string;
  /** Người dùng bấm lại được ngay (mạng/timeout/lỗi hạ tầng tạm thời). */
  retryable: boolean;
  /**
   * Dữ liệu trên máy đã cũ so với backend. UI phải tải lại bản mới rồi mới cho
   * thao tác tiếp, tuyệt đối không tự tăng `version` để gửi lại.
   */
  stale: boolean;
  /** Mã lỗi backend (nếu có) để nơi gọi rẽ nhánh đúng tình huống, ví dụ chữ ký bị từ chối thì ký lại. */
  code?: string;
};

type ErrorBody = { code?: string; message?: string };

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

function bodyOf(error: FetchBaseQueryError): ErrorBody {
  const data = 'data' in error ? error.data : undefined;
  return typeof data === 'object' && data !== null ? (data as ErrorBody) : {};
}

/**
 * Chuyển lỗi RTK Query sang thông báo tiếng Việt kèm hai tín hiệu điều hướng UI.
 * `toUserMessage` của `@/lib/api` chỉ hiểu lớp fetch thủ công nên không dùng lại
 * được cho các endpoint đi qua RTK Query.
 */
export function toActionError(error: unknown): ActionError {
  if (!isFetchBaseQueryError(error)) {
    return {
      message: 'Không thực hiện được yêu cầu. Vui lòng thử lại.',
      retryable: true,
      stale: false,
    };
  }

  if (error.status === 'FETCH_ERROR') {
    return {
      message: 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.',
      retryable: true,
      stale: false,
    };
  }

  if (error.status === 'TIMEOUT_ERROR') {
    return {
      message: 'Máy chủ phản hồi quá lâu. Tải lại rồi thử lại; yêu cầu trước có thể đã được ghi nhận.',
      retryable: true,
      stale: false,
    };
  }

  if (error.status === 'PARSING_ERROR' || error.status === 'CUSTOM_ERROR') {
    return {
      message: 'Máy chủ trả về dữ liệu không đọc được. Vui lòng thử lại sau.',
      retryable: true,
      stale: false,
    };
  }

  const body = bodyOf(error);

  // Ký PAdES nối tiếp (W3C): bên khác đang có phiên ký chờ trên hợp đồng. Dữ liệu trên máy không cũ và không có
  // gì được ghi cho lần bấm này; người dùng tự bấm ký lại sau vài phút, cùng ý định nên giữ idempotency key. Không
  // tự thử lại theo vòng lặp.
  if (body.code === SIGNATURE_IN_PROGRESS_CODE) {
    return { message: SIGNATURE_IN_PROGRESS_MESSAGE, retryable: true, stale: false, code: body.code };
  }

  // 503 sau khi backend đã hủy hẳn lần ký có chữ ký không khớp chứng thư và trả hợp đồng về chờ ký: mời ký lại.
  if (body.code === SIGNATURE_REJECTED_CODE) {
    return { message: SIGNATURE_REJECTED_MESSAGE, retryable: true, stale: false, code: body.code };
  }

  if (error.status === 409) {
    return {
      message:
        body.message ??
        'Nội dung đã được cập nhật ở nơi khác. Hãy tải lại bản mới nhất rồi xác nhận lại.',
      retryable: false,
      stale: true,
      code: body.code,
    };
  }

  // 403 `PIN_REQUIRED`/`PIN_TOKEN_INVALID` (token PIN hết 3 phút hoặc sai phạm vi) không phải
  // lỗi phiên: hiện nguyên lời backend để người dùng biết chỉ cần bấm ký lại và nhập PIN.
  if (error.status === 403 && body.code?.startsWith('PIN_') && body.message) {
    return { message: body.message, retryable: true, stale: false, code: body.code };
  }

  if (error.status === 401 || error.status === 403) {
    return {
      message: 'Phiên đăng nhập không còn hợp lệ hoặc bạn không có quyền thực hiện thao tác này.',
      retryable: false,
      stale: false,
    };
  }

  if (typeof error.status === 'number' && error.status >= 500) {
    return {
      message: body.message ?? 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.',
      retryable: true,
      stale: false,
      code: body.code,
    };
  }

  return {
    message: body.message ?? 'Yêu cầu không được chấp nhận. Vui lòng tải lại và kiểm tra lại thông tin.',
    retryable: false,
    stale: false,
    code: body.code,
  };
}

/** Thông báo cho màn không tải được dữ liệu. */
export function toLoadError(error: unknown, fallback: string): string {
  if (!isFetchBaseQueryError(error)) return fallback;
  if (error.status === 'FETCH_ERROR') return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  if (error.status === 'TIMEOUT_ERROR') return 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.';
  if (error.status === 404) return 'Không tìm thấy dữ liệu này. Có thể nó đã bị gỡ khỏi hệ thống.';
  return bodyOf(error).message ?? fallback;
}
