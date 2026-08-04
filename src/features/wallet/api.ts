import { isMocked } from '@/lib/mockFlag';
import * as walletMock from '@/lib/mocks/wallet';
import { ApiError, apiFetch } from '@/lib/api';
import type {
  DueInstallment,
  LinkedBankAccount,
  TopUpInstruction,
  WalletBalance,
  WalletTransaction,
  WithdrawQuote,
} from '@/types/wallet';

/**
 * `WalletController` của `finora-payment` hiện mới chỉ có `/health`, nên toàn bộ
 * miền ví chạy mock. Khi endpoint thật xong, xoá `wallet` khỏi
 * `EXPO_PUBLIC_MOCK_DOMAINS` là nhánh HTTP bên dưới tự được dùng.
 */
const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const getBalance = (): Promise<WalletBalance> =>
  isMocked('wallet') ? walletMock.getBalance() : apiFetch<WalletBalance>('/wallets/me');

export const getTransactions = (): Promise<WalletTransaction[]> =>
  isMocked('wallet')
    ? walletMock.getTransactions()
    : apiFetch<WalletTransaction[]>('/wallets/me/transactions');

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
