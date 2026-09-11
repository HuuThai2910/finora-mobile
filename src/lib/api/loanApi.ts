import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { getValidAccessToken, refreshAccessToken } from '@/lib/authSession';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1',
  prepareHeaders: async headers => {
    // Làm mới sớm nếu token sắp hết hạn, nên request bình thường không phải đi
    // hai vòng mạng chỉ để đổi token.
    const token = await getValidAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

/**
 * Kênh gọi Loan Service, dùng chung phiên đăng nhập với `@/lib/api`.
 *
 * Loan Service đọc claim `user_id` trong access token để biết hồ sơ vay thuộc về
 * ai, nên thiếu header `Authorization` là request bị từ chối chứ không còn rơi về
 * người vay mặc định như trước.
 *
 * Token hết hạn được xử lý ở hai lớp: `prepareHeaders` đổi trước khi hết hạn, còn
 * nhánh 401 dưới đây lo những trường hợp còn lại — đồng hồ máy lệch, token bị thu
 * hồi sớm, hoặc request nằm chờ quá lâu trong hàng đợi.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status !== 401) return result;

  // `refreshAccessToken` gộp các lời gọi trùng nhau, nên nhiều request cùng nhận
  // 401 vẫn chỉ xoay vòng refresh token một lần.
  const renewed = await refreshAccessToken();
  if (!renewed) return result;

  return rawBaseQuery(args, api, extraOptions);
};

export const LOAN_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1';

export function loanApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${LOAN_API_BASE_URL.replace(/\/$/, '')}${normalizedPath}`;
}

export const loanApi = createApi({
  reducerPath: 'loanApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['LoanProduct', 'LoanApplication', 'LoanApplicationList', 'LoanContract', 'LoanContractList'],
  endpoints: () => ({}),
});
