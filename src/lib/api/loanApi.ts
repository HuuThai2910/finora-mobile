import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const loanApi = createApi({
  reducerPath: 'loanApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8081/api/v1',
  }),
  tagTypes: ['LoanProduct', 'LoanApplication', 'LoanApplicationList', 'LoanContract', 'LoanContractList'],
  endpoints: () => ({}),
});

