/**
 * Nơi giữ access token đang dùng cho các lời gọi API.
 *
 * Token nằm trong biến module chứ không trong Context vì tầng HTTP không phải
 * component nên không đọc được Context. `AuthProvider` là nơi duy nhất được ghi
 * vào đây, giữ đúng một nguồn sự thật cho phiên đăng nhập.
 *
 * Access token cố ý không chạm tới ổ đĩa; chỉ refresh token mới được lưu lâu dài
 * và lưu trong secure storage.
 */

type RefreshHandler = () => Promise<string | null>;

let accessToken: string | null = null;
let refreshHandler: RefreshHandler | null = null;

/** Thời điểm access token hết hạn, tính bằng mili giây. `null` khi chưa đọc được. */
let accessTokenExpiresAt: number | null = null;

/** Lời gọi làm mới đang chạy — dùng lại cho mọi request 401 cùng lúc. */
let inFlightRefresh: Promise<string | null> | null = null;

/**
 * Làm mới sớm bao lâu trước khi token hết hạn.
 *
 * Access token của Keycloak sống 15 phút. Đổi trước 5 phút để một request khởi
 * hành lúc token gần hết hạn không bị hết hiệu lực giữa đường — chờ 401 rồi mới
 * đổi thì người dùng phải chịu thêm một vòng mạng, và với thao tác không
 * idempotent thì lần thử lại chưa chắc an toàn.
 */
const REFRESH_LEEWAY_MS = 5 * 60 * 1000;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
  accessTokenExpiresAt = token ? readExpiry(token) : null;
};

/**
 * Đọc hạn dùng từ phần payload của JWT.
 *
 * Chỉ để canh lịch làm mới, không phải để tin vào nội dung token: chữ ký vẫn do
 * backend kiểm. Token dị dạng thì trả `null` và luồng 401 sẵn có lo tiếp.
 */
function readExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    // JWT dùng base64url; `atob` chỉ hiểu base64 chuẩn nên phải đổi ký tự và bù đệm.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const { exp } = JSON.parse(atob(padded)) as { exp?: number };
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Token đã hết hạn hoặc sắp hết hạn trong khoảng đệm. */
const isExpiringSoon = (): boolean =>
  accessTokenExpiresAt !== null && Date.now() >= accessTokenExpiresAt - REFRESH_LEEWAY_MS;

/**
 * Trả access token còn đủ hạn để gửi đi, tự làm mới trước nếu sắp hết hạn.
 *
 * Tầng HTTP gọi hàm này thay cho `getAccessToken` khi chuẩn bị request. Nếu việc
 * làm mới thất bại thì vẫn trả token cũ: có thể nó còn vài giây hợp lệ, và nếu
 * không thì 401 sẽ dẫn tới luồng đăng nhập lại như trước.
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  if (accessToken && isExpiringSoon()) {
    const renewed = await refreshAccessToken();
    if (renewed) return renewed;
  }
  return accessToken;
};

/**
 * Đăng ký cách lấy access token mới. `AuthProvider` cung cấp hàm này lúc mount
 * và gỡ ra khi unmount để tầng HTTP không giữ tham chiếu tới cây React đã chết.
 */
export const setRefreshHandler = (handler: RefreshHandler | null): void => {
  refreshHandler = handler;
};

/**
 * Làm mới access token, gộp các lời gọi trùng nhau.
 *
 * Nhiều request có thể cùng nhận 401 một lúc; nếu mỗi request tự gọi refresh thì
 * refresh token bị xoay vòng nhiều lần và các lần sau thất bại. Vì vậy chỉ lời
 * gọi đầu tiên chạy thật, những lời gọi còn lại chờ chung kết quả đó.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshHandler) return null;
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = refreshHandler().finally(() => {
    inFlightRefresh = null;
  });

  return inFlightRefresh;
};
