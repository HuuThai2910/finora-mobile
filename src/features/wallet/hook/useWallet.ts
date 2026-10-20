import { useAsync } from '@/hooks/useAsync';
import {
  getBalance,
  getDueInstallment,
  getTopUpInstruction,
  getTransactions,
  getWithdrawalPolicy,
} from '../api';

export const useBalance = () => useAsync(getBalance, []);
export const useTransactions = () => useAsync(getTransactions, []);
export const useTopUpInstruction = () => useAsync(getTopUpInstruction, []);
export const useDueInstallment = () => useAsync(getDueInstallment, []);
/** Policy rút tiền; tải lại giữ nguyên dữ liệu cũ trên màn trong lúc chờ (form đang nhập không bị gỡ). */
export const useWithdrawalPolicy = () => useAsync(getWithdrawalPolicy, []);
