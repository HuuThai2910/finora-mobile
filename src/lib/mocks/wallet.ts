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
  WalletBalance,
  WalletTransaction,
  WithdrawQuote,
} from '@/types/wallet';

export const getBalance = (): Promise<WalletBalance> => mockResponse('wallet', BALANCE);

export const getTransactions = (): Promise<WalletTransaction[]> =>
  mockResponse('wallet', WALLET_TRANSACTIONS);

export const getTopUpInstruction = (): Promise<TopUpInstruction> => mockResponse('wallet', TOPUP);

export const getLinkedAccount = (): Promise<LinkedBankAccount | null> =>
  mockResponse('wallet', PROFILE.linkedBank);

export const getWithdrawQuote = (): Promise<WithdrawQuote> => mockResponse('wallet', WITHDRAW_QUOTE);

export const getDueInstallment = (): Promise<DueInstallment> =>
  mockResponse('wallet', DUE_INSTALLMENT);

/** Trả nợ từ ví — bản mock chỉ xác nhận, không đổi số dư lưu trữ. */
export const payInstallment = (): Promise<{ ok: true }> => mockResponse('wallet', { ok: true });

export const withdraw = (): Promise<{ ok: true }> => mockResponse('wallet', { ok: true });
