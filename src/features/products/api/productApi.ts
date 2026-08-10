import { loanApi } from '@/lib/api/loanApi';
import type {
  LoanProductCatalog,
  LoanPurpose,
  PageResponse,
  RepaymentPreview,
  RepaymentPreviewRequest,
} from '@/types/loan';

const productApi = loanApi.injectEndpoints({
  endpoints: builder => ({
    listProducts: builder.query<PageResponse<LoanProductCatalog>, { page?: number; size?: number }>({
      query: params => ({ url: '/loan-products', params }),
      providesTags: result => [
        { type: 'LoanProduct', id: 'LIST' },
        ...(result?.data.map(product => ({ type: 'LoanProduct' as const, id: product.id })) ?? []),
      ],
    }),
    getProduct: builder.query<LoanProductCatalog, number>({
      query: id => `/loan-products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'LoanProduct', id }],
    }),
    listPurposes: builder.query<LoanPurpose[], void>({ query: () => '/loan-purposes' }),
    getRepaymentPreview: builder.mutation<RepaymentPreview, {
      productId: number;
      body: RepaymentPreviewRequest;
    }>({
      query: ({ productId, body }) => ({
        url: `/loan-products/${productId}/repayment-previews`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductQuery,
  useListPurposesQuery,
  useGetRepaymentPreviewMutation,
} = productApi;

