import { isMocked } from '@/lib/mockFlag';
import * as investMock from '@/lib/mocks/invest';
import { ApiError } from '@/lib/api';
import type { MarketLoan } from '@/types/invest';

/** Sàn khoản vay thuộc `finora-investment`, chưa lộ endpoint nào qua gateway. */
const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const listMarketLoans = (): Promise<MarketLoan[]> =>
  isMocked('market') ? investMock.listMarketLoans() : notImplemented('Sàn khoản vay');

export const getMarketLoan = (loanId: string): Promise<MarketLoan> =>
  isMocked('market') ? investMock.getMarketLoan(loanId) : notImplemented('Chi tiết khoản vay');

export const invest = (): Promise<{ ok: true }> =>
  isMocked('invest') ? investMock.invest() : notImplemented('Đặt lệnh đầu tư');
