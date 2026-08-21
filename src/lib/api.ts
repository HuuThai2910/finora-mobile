import { getAccessToken, refreshAccessToken } from './authSession';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1';

/**
 * Xác thực và hồ sơ người dùng do `finora-user` phục vụ, đứng sau Gateway ở cổng
 * khác với Loan Service, nên có base URL riêng.
 */
const AUTH_BASE_URL = process.env.EXPO_PUBLIC_AUTH_API_URL ?? 'http://localhost:8080/api/v1';

/**
 * `finora-user` đọc header này để biết trả token trong body thay vì đặt cookie
 * (xem `HttpRequestUtils.isMobileClient`). Thiếu header là mobile không nhận được token.
 */
const MOBILE_CLIENT_HEADERS = { 'X-Client-Type': 'mobile' } as const;

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
    if (this.code === 'CORE_LENDING_UNAVAILABLE') {
      return 'Hệ thống đang chuẩn bị lịch trả nợ. Vui lòng đợi khoảng 30 giây rồi thử lại.';
    }
    if (this.serverMessage) return this.serverMessage;
    if (this.status === 401 || this.status === 403) return 'Phiên đăng nhập đã hết hạn.';
    if (this.status === 404) return 'Không tìm thấy dữ liệu.';
    if (this.status === 422) return 'Dữ liệu gửi lên chưa hợp lệ.';
    if (this.status === 429) return 'Bạn thao tác quá nhiều lần, vui lòng thử lại sau.';
    if (this.status >= 500) return 'Hệ thống đang bận, vui lòng thử lại sau.';
    return 'Không thực hiện được yêu cầu.';
  }

  /** Lỗi do người dùng nhập sai hoặc nghiệp vụ chặn — thử lại y nguyên cũng vô ích. */
  get isBusinessError(): boolean {
    return this.status >= 400 && this.status < 500;
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

type RequestOptions = RequestInit & {
  /** Gắn `Authorization: Bearer` và tự làm mới token một lần khi gặp 401. */
  authenticated?: boolean;
};

async function send(baseUrl: string, path: string, init: RequestOptions): Promise<Response> {
  const { headers, authenticated, ...rest } = init;
  const token = authenticated ? getAccessToken() : null;

  try {
    return await fetch(`${baseUrl}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...MOBILE_CLIENT_HEADERS,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers as Record<string, string>),
      },
    });
  } catch (e) {
    throw new NetworkError(e);
  }
}

async function request<T>(baseUrl: string, path: string, init: RequestOptions = {}): Promise<T> {
  let res = await send(baseUrl, path, init);

  // Access token của Keycloak sống ngắn. Gặp 401 thì thử làm mới đúng một lần;
  // lần thứ hai vẫn 401 nghĩa là phiên hỏng thật và người dùng phải đăng nhập lại.
  if (res.status === 401 && init.authenticated) {
    const renewed = await refreshAccessToken();
    if (renewed) {
      res = await send(baseUrl, path, init);
    }
  }

  if (!res.ok) {
    const body = await res.text();
    const { code, message, traceId } = parseError(body);
    throw new ApiError(res.status, body, code, message, traceId);
  }

  return parseBody<T>(res);
}

/**
 * Vài endpoint (`forgot-password`, `logout`) trả 200 với thân rỗng nên không
 * gọi `res.json()` được. Trả `undefined` cho những trường hợp đó.
 */
async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}

/** Gọi Loan Service qua gateway, có gắn token của phiên đăng nhập. */
export const apiFetch = <T>(path: string, init?: RequestInit): Promise<T> =>
  request<T>(BASE_URL, path, { ...init, authenticated: true });

/** Gọi endpoint công khai của `finora-user` — đăng nhập, đăng ký, quên mật khẩu. */
export const authFetch = <T>(path: string, init?: RequestInit): Promise<T> =>
  request<T>(AUTH_BASE_URL, path, init ?? {});

/** Gọi endpoint của `finora-user` cần đăng nhập, ví dụ `GET /users/me`. */
export const authFetchWithToken = <T>(path: string, init?: RequestInit): Promise<T> =>
  request<T>(AUTH_BASE_URL, path, { ...init, authenticated: true });

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
