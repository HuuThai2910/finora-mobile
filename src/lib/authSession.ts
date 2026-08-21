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

/** Lời gọi làm mới đang chạy — dùng lại cho mọi request 401 cùng lúc. */
let inFlightRefresh: Promise<string | null> | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
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
