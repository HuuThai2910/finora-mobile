import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export type ActionError = {
  message: string;
  /** Người dùng bấm lại được ngay (mạng/timeout/lỗi hạ tầng tạm thời). */
  retryable: boolean;
  /**
   * Dữ liệu trên máy đã cũ so với backend. UI phải tải lại bản mới rồi mới cho
   * thao tác tiếp, tuyệt đối không tự tăng `version` để gửi lại.
   */
  stale: boolean;
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

  if (error.status === 409) {
    return {
      message:
        body.message ??
        'Nội dung đã được cập nhật ở nơi khác. Hãy tải lại bản mới nhất rồi xác nhận lại.',
      retryable: false,
      stale: true,
    };
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
    };
  }

  return {
    message: body.message ?? 'Yêu cầu không được chấp nhận. Vui lòng tải lại và kiểm tra lại thông tin.',
    retryable: false,
    stale: false,
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
