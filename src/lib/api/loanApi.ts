import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const LOAN_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1';

export function loanApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${LOAN_API_BASE_URL.replace(/\/$/, '')}${normalizedPath}`;
}

export const loanApi = createApi({
  reducerPath: 'loanApi',
  baseQuery: fetchBaseQuery({
    baseUrl: LOAN_API_BASE_URL,
  }),
  tagTypes: ['LoanProduct', 'LoanApplication', 'LoanApplicationList', 'LoanContract', 'LoanContractList'],
  endpoints: () => ({}),
});
