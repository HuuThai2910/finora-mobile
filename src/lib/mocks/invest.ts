import { mockResponse } from './delay';
import {
  AUTO_INVEST,
  AUTO_INVEST_MATCHES,
  INVESTMENT_CONTRACT,
  MARKET_LOANS,
  PORTFOLIO,
} from './fixtures';
import type {
  AutoInvestConfig,
  AutoInvestMatch,
  InvestmentContract,
  MarketLoan,
  PortfolioSummary,
} from '@/types/invest';

export const listMarketLoans = (): Promise<MarketLoan[]> => mockResponse('market', MARKET_LOANS);

export const getMarketLoan = (id: string): Promise<MarketLoan> => {
  const found = MARKET_LOANS.find(l => l.id === id) ?? MARKET_LOANS[2];
  return mockResponse('market', found);
};

export const getPortfolio = (): Promise<PortfolioSummary> => mockResponse('invest', PORTFOLIO);

export const getAutoInvest = (): Promise<AutoInvestConfig> => mockResponse('invest', AUTO_INVEST);

export const getAutoInvestMatches = (): Promise<AutoInvestMatch[]> =>
  mockResponse('invest', AUTO_INVEST_MATCHES);

export const getInvestmentContract = (): Promise<InvestmentContract> =>
  mockResponse('signature', INVESTMENT_CONTRACT);

/** Đặt lệnh đầu tư — tiền bị phong tỏa trong ví cho tới khi gọi đủ vốn. */
export const invest = (): Promise<{ ok: true }> => mockResponse('invest', { ok: true });

export const signContract = (): Promise<{ ok: true }> => mockResponse('signature', { ok: true });
