const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1';

/**
 * Lỗi từ API, giữ đủ ngữ cảnh để màn hình chọn được thông điệp phù hợp
 * thay vì chỉ có một chuỗi thô.
 *
 * Các service Java trả `ApiErrorResponse { code, message, details, traceId }`
 * (xem `finora-common`), trong đó `message` đã được viết cho người dùng đọc.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly body: string;
  readonly serverMessage: string | null;
  readonly traceId: string | null;

  constructor(
    status: number,
    body: string,
    code = 'UNKNOWN',
    serverMessage: string | null = null,
    traceId: string | null = null,
  ) {
    super(`API ${status}: ${body}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
    this.serverMessage = serverMessage;
    this.traceId = traceId;
  }

  /** Thông điệp hiển thị cho người dùng, không lộ chi tiết kỹ thuật. */
  get userMessage(): string {
    if (this.serverMessage) return this.serverMessage;
    if (this.status === 401 || this.status === 403) return 'Phiên đăng nhập đã hết hạn.';
    if (this.status === 404) return 'Không tìm thấy dữ liệu.';
    if (this.status === 422) return 'Dữ liệu gửi lên chưa hợp lệ.';
    if (this.status >= 500) return 'Hệ thống đang bận, vui lòng thử lại sau.';
    return 'Không thực hiện được yêu cầu.';
  }
}

/** Lỗi mạng — phân biệt với lỗi do máy chủ trả về. */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Không kết nối được máy chủ.');
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

/** Thông điệp hiển thị cho bất kỳ lỗi nào rơi ra từ tầng dữ liệu. */
export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) return error.userMessage;
  if (error instanceof NetworkError) return error.message;
  return 'Đã xảy ra lỗi không xác định.';
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const { headers, ...rest } = init ?? {};

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...rest,
      headers: { 'Content-Type': 'application/json', ...(headers as Record<string, string>) },
    });
  } catch (e) {
    throw new NetworkError(e);
  }

  if (!res.ok) {
    const body = await res.text();
    const { code, message, traceId } = parseError(body);
    throw new ApiError(res.status, body, code, message, traceId);
  }

  return res.json();
}

/** Gọi các service Java qua gateway. */
export const apiFetch = <T>(path: string, init?: RequestInit): Promise<T> =>
  request<T>(BASE_URL, path, init);

type ParsedError = { code: string; message: string | null; traceId: string | null };

/**
 * Java: `{ code, message, details, traceId }`.
 * Client chỉ gọi Loan Service; chi tiết lỗi của AI/Fineract được Loan Service chuẩn hóa.
 */
function parseError(body: string): ParsedError {
  try {
    const parsed = JSON.parse(body) as {
      code?: string;
      message?: string;
      traceId?: string;
    };

    if (parsed.code) {
      return {
        code: parsed.code,
        message: parsed.message ?? null,
        traceId: parsed.traceId ?? null,
      };
    }

    return { code: 'VALIDATION_ERROR', message: null, traceId: null };
  } catch {
    return { code: 'UNKNOWN', message: null, traceId: null };
  }
}

export function generateIdempotencyKey(): string {
  return `mob-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
