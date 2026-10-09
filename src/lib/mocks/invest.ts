import { mockResponse } from './delay';
import {
  AUTO_INVEST,
  AUTO_INVEST_MATCHES,
  BALANCE,
  BORROWER_PROFILES,
  INVESTMENT_CONTRACT,
  MARKET_LOANS,
  PORTFOLIO,
} from './fixtures';
import type {
  AutoInvestConfig,
  AutoInvestMatch,
  BorrowerProfile,
  InvestmentContract,
  InvestOrderResult,
  MarketLoan,
  PortfolioSummary,
} from '@/types/invest';

export const listMarketLoans = (): Promise<MarketLoan[]> => mockResponse('market', MARKET_LOANS);

export const getMarketLoan = (id: string): Promise<MarketLoan> => {
  const found = MARKET_LOANS.find(l => l.id === id) ?? MARKET_LOANS[2];
  return mockResponse('market', found);
};

/** Mã lạ rơi về hồ sơ của LN-2044, giống `getMarketLoan` rơi về khoản vay đó. */
export const getBorrowerProfile = (applicationNumber: string): Promise<BorrowerProfile> =>
  mockResponse('market', BORROWER_PROFILES[applicationNumber] ?? BORROWER_PROFILES['LA-MOCK-2044']);

export const getPortfolio = (): Promise<PortfolioSummary> => mockResponse('invest', PORTFOLIO);

export const getAutoInvest = (): Promise<AutoInvestConfig> => mockResponse('invest', AUTO_INVEST);

export const getAutoInvestMatches = (): Promise<AutoInvestMatch[]> =>
  mockResponse('invest', AUTO_INVEST_MATCHES);

export const saveAutoInvest = (config: AutoInvestConfig): Promise<AutoInvestConfig> =>
  mockResponse('invest', config);

export const getInvestmentContract = (): Promise<InvestmentContract> =>
  mockResponse('signature', INVESTMENT_CONTRACT);

/**
 * Đặt lệnh đầu tư — tiền bị phong tỏa trong ví cho tới khi gọi đủ vốn.
 *
 * Giống Payment thật: số tiền vượt số dư khả dụng của ví giả thì lệnh vẫn "thành công" ở tầng
 * HTTP nhưng mang `REJECTED`, để thử được nhánh mời nạp tiền mà không cần backend.
 */
export const invest = (listingId: string, amount: number): Promise<InvestOrderResult> => {
  const covered = amount <= BALANCE.available;
  return mockResponse('invest', {
    orderReference: `IO-MOCK-${listingId}-${Date.now()}`,
    amount,
    status: covered ? 'COMMITTED' : 'REJECTED',
    rejectedReasonCode: covered ? null : 'PAYMENT_INSUFFICIENT_BALANCE',
    rejectedReasonDetail: covered ? null : 'Số dư wallet không đủ cho giao dịch',
  });
};

export const signContract = (): Promise<{ ok: true }> => mockResponse('signature', { ok: true });
