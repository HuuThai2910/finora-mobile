import { loanApi } from '@/lib/api/loanApi';
import type {
  CreateLoanApplicationRequest,
  LoanApplication,
  LoanApplicationHistory,
  PageResponse,
} from '@/types/loan';
import type {
  LoanContractActionResponse,
  LoanContractDetail,
  LoanContractHistory,
  LoanContractSummary,
} from '@/types/contract';

const applicationApi = loanApi.injectEndpoints({
  endpoints: builder => ({
    createApplication: builder.mutation<LoanApplication, {
      body: CreateLoanApplicationRequest;
      idempotencyKey: string;
    }>({
      query: ({ body, idempotencyKey }) => ({
        url: '/loan-applications',
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body,
      }),
      invalidatesTags: [{ type: 'LoanApplicationList', id: 'ME' }],
    }),
    listMyApplications: builder.query<PageResponse<LoanApplication>, { page?: number; size?: number }>({
      query: params => ({ url: '/loan-applications/me', params }),
      providesTags: result => [
        { type: 'LoanApplicationList', id: 'ME' },
        ...(result?.data.map(item => ({ type: 'LoanApplication' as const, id: item.applicationNumber })) ?? []),
      ],
    }),
    getApplication: builder.query<LoanApplication, string>({
      query: applicationNumber => `/loan-applications/${applicationNumber}`,
      providesTags: (_result, _error, applicationNumber) => [{ type: 'LoanApplication', id: applicationNumber }],
    }),
    getApplicationHistory: builder.query<PageResponse<LoanApplicationHistory>, {
      applicationNumber: string;
      page?: number;
      size?: number;
    }>({
      query: ({ applicationNumber, ...params }) => ({
        url: `/loan-applications/${applicationNumber}/history`,
        params,
      }),
    }),
    withdrawApplication: builder.mutation<LoanApplication, {
      applicationNumber: string;
      version: number;
      reason?: string;
    }>({
      query: ({ applicationNumber, ...body }) => ({
        url: `/loan-applications/${applicationNumber}/withdraw`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { applicationNumber }) => [
        { type: 'LoanApplication', id: applicationNumber },
        { type: 'LoanApplicationList', id: 'ME' },
      ],
    }),
    listMyContracts: builder.query<PageResponse<LoanContractSummary>, { page?: number; size?: number }>({
      query: params => ({ url: '/loan-contracts/me', params }),
      providesTags: result => [
        { type: 'LoanContractList', id: 'ME' },
        ...(result?.data.map(item => ({ type: 'LoanContract' as const, id: item.contractNumber })) ?? []),
      ],
    }),
    getContract: builder.query<LoanContractDetail, string>({
      query: contractNumber => `/loan-contracts/${contractNumber}`,
      providesTags: (_result, _error, contractNumber) => [{ type: 'LoanContract', id: contractNumber }],
    }),
    getContractHistory: builder.query<PageResponse<LoanContractHistory>, {
      contractNumber: string;
      page?: number;
      size?: number;
    }>({
      query: ({ contractNumber, ...params }) => ({ url: `/loan-contracts/${contractNumber}/history`, params }),
    }),
    signContract: builder.mutation<LoanContractActionResponse, {
      contractNumber: string;
      version: number;
      documentHash: string;
      pdfDocumentHash?: string;
      idempotencyKey: string;
    }>({
      query: ({ contractNumber, idempotencyKey, ...body }) => ({
        url: `/loan-contracts/${contractNumber}/sign`,
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: { ...body, signatureMethod: 'CLICK_WRAP_MVP' },
      }),
      invalidatesTags: (_result, _error, { contractNumber }) => [
        { type: 'LoanContract', id: contractNumber },
        { type: 'LoanContractList', id: 'ME' },
      ],
    }),
    declineContract: builder.mutation<LoanContractActionResponse, {
      contractNumber: string;
      version: number;
      reasonCode: 'TERMS_NOT_ACCEPTED' | 'BORROWER_CHANGED_MIND' | 'OTHER';
      reasonDetail?: string;
      idempotencyKey: string;
    }>({
      query: ({ contractNumber, idempotencyKey, ...body }) => ({
        url: `/loan-contracts/${contractNumber}/decline`,
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body,
      }),
      invalidatesTags: (_result, _error, { contractNumber }) => [
        { type: 'LoanContract', id: contractNumber },
        { type: 'LoanContractList', id: 'ME' },
      ],
    }),
  }),
});

export const {
  useCreateApplicationMutation,
  useListMyApplicationsQuery,
  useGetApplicationQuery,
  useGetApplicationHistoryQuery,
  useWithdrawApplicationMutation,
  useListMyContractsQuery,
  useGetContractQuery,
  useGetContractHistoryQuery,
  useSignContractMutation,
  useDeclineContractMutation,
} = applicationApi;
