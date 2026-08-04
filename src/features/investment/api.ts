import { isMocked } from '@/lib/mockFlag';
import * as investMock from '@/lib/mocks/invest';
import { ApiError } from '@/lib/api';
import type {
  AutoInvestConfig,
  AutoInvestMatch,
  InvestmentContract,
  PortfolioSummary,
} from '@/types/invest';

/**
 * `finora-investment` chưa lộ endpoint nào qua gateway, nên miền này chạy mock.
 */
const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const getPortfolio = (): Promise<PortfolioSummary> =>
  isMocked('invest') ? investMock.getPortfolio() : notImplemented('Danh mục đầu tư');

export const getAutoInvest = (): Promise<AutoInvestConfig> =>
  isMocked('invest') ? investMock.getAutoInvest() : notImplemented('Cấu hình Auto-Invest');

export const getAutoInvestMatches = (): Promise<AutoInvestMatch[]> =>
  isMocked('invest') ? investMock.getAutoInvestMatches() : notImplemented('Lịch sử khớp lệnh');

export const getInvestmentContract = (): Promise<InvestmentContract> =>
  isMocked('signature') ? investMock.getInvestmentContract() : notImplemented('Hợp đồng đầu tư');

export const invest = (): Promise<{ ok: true }> =>
  isMocked('invest') ? investMock.invest() : notImplemented('Đặt lệnh đầu tư');

export const signContract = (): Promise<{ ok: true }> =>
  isMocked('signature') ? investMock.signContract() : notImplemented('Ký số hợp đồng');
