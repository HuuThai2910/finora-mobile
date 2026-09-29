import { mockResponse } from './delay';
import {
  BALANCE,
  DUE_INSTALLMENT,
  PROFILE,
  TOPUP,
  WALLET_TRANSACTIONS,
  WITHDRAW_QUOTE,
} from './fixtures';
import type {
  DueInstallment,
  LinkedBankAccount,
  TopUpInstruction,
  TopUpOrder,
  WalletBalance,
  WalletTransaction,
  WithdrawQuote,
} from '@/types/wallet';

export const getBalance = (): Promise<WalletBalance> => mockResponse('wallet', BALANCE);

export const getTransactions = (): Promise<WalletTransaction[]> =>
  mockResponse('wallet', WALLET_TRANSACTIONS);

export const getTopUpInstruction = (): Promise<TopUpInstruction> => mockResponse('wallet', TOPUP);

let currentTopUp: TopUpOrder | null = null;

export const createTopUp = (amount: number): Promise<TopUpOrder> => {
  currentTopUp = {
    topUpId: `mock-${Date.now()}`,
    amount,
    currency: 'VND',
    provider: 'MOCK',
    providerOrderId: `MOCK-${Date.now()}`,
    providerReference: null,
    checkoutUrl: null,
    qrPayload: TOPUP.qrPayload,
    status: 'AWAITING_PAYMENT',
    errorCode: null,
    errorDetail: null,
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    completedAt: null,
    mockCompletionAvailable: true,
  };
  return mockResponse('wallet', currentTopUp);
};

export const getTopUp = (topUpId: string): Promise<TopUpOrder> =>
  mockResponse('wallet', currentTopUp ?? {
    topUpId,
    amount: 0,
    currency: 'VND',
    provider: 'MOCK',
    providerOrderId: topUpId,
    providerReference: null,
    checkoutUrl: null,
    qrPayload: null,
    status: 'FAILED',
    errorCode: 'TOPUP_NOT_FOUND',
    errorDetail: 'Không tìm thấy lệnh nạp',
    expiresAt: null,
    completedAt: null,
    mockCompletionAvailable: false,
  });

export const completeTopUp = (topUpId: string): Promise<TopUpOrder> => {
  if (currentTopUp?.topUpId === topUpId) {
    currentTopUp = {
      ...currentTopUp,
      status: 'COMPLETED',
      providerReference: `MOCK-PAID-${topUpId}`,
      completedAt: new Date().toISOString(),
      mockCompletionAvailable: false,
    };
  }
  return getTopUp(topUpId);
};

export const getLinkedAccount = (): Promise<LinkedBankAccount | null> =>
  mockResponse('wallet', PROFILE.linkedBank);

export const getWithdrawQuote = (): Promise<WithdrawQuote> => mockResponse('wallet', WITHDRAW_QUOTE);

export const getDueInstallment = (): Promise<DueInstallment> =>
  mockResponse('wallet', DUE_INSTALLMENT);

/** Trả nợ từ ví — bản mock chỉ xác nhận, không đổi số dư lưu trữ. */
export const payInstallment = (): Promise<{ ok: true }> => mockResponse('wallet', { ok: true });

export const withdraw = (): Promise<{ ok: true }> => mockResponse('wallet', { ok: true });
