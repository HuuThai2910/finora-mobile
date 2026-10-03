import { isMocked } from '@/lib/mockFlag';
import * as investMock from '@/lib/mocks/invest';
import { apiFetch, investmentFetch } from '@/lib/api';
import type {
  AutoInvestConfig,
  AutoInvestMatch,
  InvestmentContract,
  PortfolioSummary,
} from '@/types/invest';
import {
  toAutoInvestConfig,
  toAutoInvestMatch,
  toInvestmentContract,
  toPortfolioSummary,
  type AutoInvestConfigDto,
  type AutoInvestMatchDto,
  type InvestorContractDto,
  type PortfolioDto,
} from './mapper';

export const getPortfolio = async (): Promise<PortfolioSummary> => {
  if (isMocked('invest')) return investMock.getPortfolio();

  const portfolio = await investmentFetch<PortfolioDto>('/investments/portfolio');
  return toPortfolioSummary(portfolio);
};

export const getAutoInvest = async (signal?: AbortSignal): Promise<AutoInvestConfig> => {
  if (isMocked('invest')) return investMock.getAutoInvest();
  const dto = await investmentFetch<AutoInvestConfigDto>('/investments/auto-invest', { signal });
  return toAutoInvestConfig(dto);
};

export const getAutoInvestMatches = async (signal?: AbortSignal): Promise<AutoInvestMatch[]> => {
  if (isMocked('invest')) return investMock.getAutoInvestMatches();
  const dtos = await investmentFetch<AutoInvestMatchDto[]>('/investments/auto-invest/matches?limit=20', {
    signal,
  });
  return dtos.map(toAutoInvestMatch);
};

/** Lưu toàn bộ tiêu chí; bật lại sau khi tắt thì xuống cuối hàng chờ khớp lệnh. */
export const saveAutoInvest = async (config: AutoInvestConfig): Promise<AutoInvestConfig> => {
  if (isMocked('invest')) return investMock.saveAutoInvest(config);
  const dto = await investmentFetch<AutoInvestConfigDto>('/investments/auto-invest', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
  return toAutoInvestConfig(dto);
};

/**
 * Hợp đồng đầu tư cần xử lý: ưu tiên bản đang chờ mình ký, không có thì bản gần nhất. Chưa có hợp
 * đồng nào là trạng thái bình thường (chưa góp vốn vào khoản nào đủ vốn), nên trả null cho màn hiện
 * trạng thái trống thay vì báo lỗi.
 */
export const getInvestmentContract = async (signal?: AbortSignal): Promise<InvestmentContract | null> => {
  if (isMocked('signature')) return investMock.getInvestmentContract();
  const contracts = await apiFetch<InvestorContractDto[]>('/investor/loan-contracts/me', { signal });
  const selected = contracts.find(item => (item.partyStatus === 'PENDING_SIGNATURE'
      || item.partyStatus === 'SIGNING')
      && item.contractStatus === 'PENDING_LENDER_SIGNATURES')
    ?? contracts[0];
  return selected ? toInvestmentContract(selected) : null;
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
