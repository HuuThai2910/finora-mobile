import { useAsync } from '@/hooks/useAsync';
import {
  getBalance,
  getDueInstallment,
  getLinkedAccount,
  getTopUpInstruction,
  getTransactions,
  getWithdrawQuote,
} from '../api';

export const useBalance = () => useAsync(getBalance, []);
export const useTransactions = () => useAsync(getTransactions, []);
export const useTopUpInstruction = () => useAsync(getTopUpInstruction, []);
export const useLinkedAccount = () => useAsync(getLinkedAccount, []);
export const useWithdrawQuote = () => useAsync(getWithdrawQuote, []);
export const useDueInstallment = () => useAsync(getDueInstallment, []);
