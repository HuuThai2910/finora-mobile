import { isMocked } from '@/lib/mockFlag';
import * as walletMock from '@/lib/mocks/wallet';
import { ApiError, generateIdempotencyKey, paymentFetch } from '@/lib/api';
import type {
  DueInstallment,
  LinkedBankAccount,
  TopUpInstruction,
  TopUpOrder,
  WalletBalance,
  WalletTransaction,
  WithdrawQuote,
} from '@/types/wallet';

/**
 * Ví và nạp tiền dùng Payment Service. Các API rút tiền/trả nợ chưa thuộc đợt này
 * vẫn giữ mock độc lập, không làm giả số dư đã được hạch toán ở backend.
 */
const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const getBalance = (): Promise<WalletBalance> =>
  isMocked('wallet') ? walletMock.getBalance() : paymentFetch<WalletBalance>('/wallets/me');

export const getTransactions = (): Promise<WalletTransaction[]> =>
  isMocked('wallet')
    ? walletMock.getTransactions()
    : paymentFetch<WalletTransaction[]>('/wallets/me/transactions').then(items =>
        items.map(item => ({
          ...item,
          direction: (item.direction as unknown as string) === 'CREDIT' ? 'in' : 'out',
        })),
      );

export const createTopUp = (amount: number): Promise<TopUpOrder> =>
  isMocked('wallet')
    ? walletMock.createTopUp(amount)
    : paymentFetch<TopUpOrder>('/wallets/me/top-ups', {
        method: 'POST',
        headers: { 'Idempotency-Key': generateIdempotencyKey() },
        body: JSON.stringify({ amount }),
        timeoutMs: 15_000,
      });

export const getTopUp = (topUpId: string): Promise<TopUpOrder> =>
  isMocked('wallet')
    ? walletMock.getTopUp(topUpId)
    : paymentFetch<TopUpOrder>(`/wallets/me/top-ups/${encodeURIComponent(topUpId)}`);

export const completeMockTopUp = (topUpId: string): Promise<TopUpOrder> =>
  isMocked('wallet')
    ? walletMock.completeTopUp(topUpId)
    : paymentFetch<TopUpOrder>(
        `/wallets/me/top-ups/${encodeURIComponent(topUpId)}/mock-complete`,
        { method: 'POST' },
      );

export const getTopUpInstruction = (): Promise<TopUpInstruction> =>
  isMocked('wallet') ? walletMock.getTopUpInstruction() : notImplemented('Nạp tiền VietQR');

export const getLinkedAccount = (): Promise<LinkedBankAccount | null> =>
  isMocked('wallet') ? walletMock.getLinkedAccount() : notImplemented('Tài khoản liên kết');

export const getWithdrawQuote = (): Promise<WithdrawQuote> =>
  isMocked('wallet') ? walletMock.getWithdrawQuote() : notImplemented('Báo giá rút tiền');

export const getDueInstallment = (): Promise<DueInstallment> =>
  isMocked('wallet') ? walletMock.getDueInstallment() : notImplemented('Kỳ trả đến hạn');

export const payInstallment = (): Promise<{ ok: true }> =>
  isMocked('wallet') ? walletMock.payInstallment() : notImplemented('Thanh toán kỳ');

export const withdraw = (): Promise<{ ok: true }> =>
  isMocked('wallet') ? walletMock.withdraw() : notImplemented('Rút tiền');
