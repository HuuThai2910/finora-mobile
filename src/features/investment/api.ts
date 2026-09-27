import { isMocked } from '@/lib/mockFlag';
import * as investMock from '@/lib/mocks/invest';
import { ApiError, apiFetch, investmentFetch } from '@/lib/api';
import type {
  AutoInvestConfig,
  AutoInvestMatch,
  InvestmentContract,
  PortfolioSummary,
} from '@/types/invest';
import {
  toInvestmentContract,
  toPortfolioSummary,
  type InvestorContractDto,
  type PortfolioDto,
} from './mapper';

/** Phần chưa có endpoint thật thì báo rõ thay vì trả dữ liệu giả trong luồng thật. */
const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const getPortfolio = async (): Promise<PortfolioSummary> => {
  if (isMocked('invest')) return investMock.getPortfolio();

  const portfolio = await investmentFetch<PortfolioDto>('/investments/portfolio');
  return toPortfolioSummary(portfolio);
};

/** Auto-Invest (C2.1) là task riêng, chưa thuộc phạm vi gọi vốn. */
export const getAutoInvest = (): Promise<AutoInvestConfig> =>
  isMocked('invest') ? investMock.getAutoInvest() : notImplemented('Cấu hình Auto-Invest');

export const getAutoInvestMatches = (): Promise<AutoInvestMatch[]> =>
  isMocked('invest') ? investMock.getAutoInvestMatches() : notImplemented('Lịch sử khớp lệnh');

export const getInvestmentContract = async (signal?: AbortSignal): Promise<InvestmentContract> => {
  if (isMocked('signature')) return investMock.getInvestmentContract();
  const contracts = await apiFetch<InvestorContractDto[]>('/investor/loan-contracts/me', { signal });
  const selected = contracts.find(item => (item.partyStatus === 'PENDING_SIGNATURE'
      || item.partyStatus === 'SIGNING')
      && item.contractStatus === 'PENDING_LENDER_SIGNATURES')
    ?? contracts[0];
  if (!selected) {
    throw new ApiError(404, 'Bạn chưa có hợp đồng đầu tư cần ký', 'CONTRACT_NOT_FOUND');
  }
  return toInvestmentContract(selected);
};

/** Retry cùng một ý định phải truyền lại đúng idempotency key do screen đang giữ. */
export const signContract = async (
  contract: InvestmentContract,
  idempotencyKey: string,
): Promise<InvestmentContract> => {
  if (isMocked('signature')) {
    await investMock.signContract();
    return { ...contract, status: 'SIGNED' };
  }
  const signed = await apiFetch<InvestorContractDto>(
    `/investor/loan-contracts/${contract.reference}/sign`,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        version: contract.version,
        documentHash: contract.documentHash,
        pdfDocumentHash: contract.pdfDocumentHash,
        signatureMethod: contract.availableSignatureMethod,
      }),
    },
  );
  return toInvestmentContract(signed);
};

/** Lấy trạng thái mới nhất của giao dịch SmartCA đang chờ nhà đầu tư xác nhận. */
export const refreshContractSignature = async (
  contract: InvestmentContract,
): Promise<InvestmentContract> => {
  const refreshed = await apiFetch<InvestorContractDto>(
    `/investor/loan-contracts/${contract.reference}/signature/refresh`,
    { method: 'POST' },
  );
  return toInvestmentContract(refreshed);
};
