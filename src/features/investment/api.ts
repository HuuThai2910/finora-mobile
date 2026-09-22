import { isMocked } from '@/lib/mockFlag';
import * as investMock from '@/lib/mocks/invest';
import { ApiError, investmentFetch } from '@/lib/api';
import type {
  AutoInvestConfig,
  AutoInvestMatch,
  InvestmentContract,
  PortfolioSummary,
} from '@/types/invest';
import { toPortfolioSummary, type PortfolioDto } from './mapper';

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

export const getInvestmentContract = (): Promise<InvestmentContract> =>
  isMocked('signature') ? investMock.getInvestmentContract() : notImplemented('Hợp đồng đầu tư');

export const signContract = (): Promise<{ ok: true }> =>
  isMocked('signature') ? investMock.signContract() : notImplemented('Ký số hợp đồng');
