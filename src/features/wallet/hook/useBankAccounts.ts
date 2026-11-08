import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAsync } from '@/hooks/useAsync';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import { usePinGuard } from '@/features/pin';
import type { BankAccount } from '@/types/wallet';
import { getBankAccounts, removeBankAccount, setDefaultBankAccount } from '../api';

/** Cùng một mảng rỗng mỗi lần render, để effect phụ thuộc danh sách không chạy lại vô ích khi chưa tải xong. */
const NO_ACCOUNTS: readonly BankAccount[] = [];

/**
 * Tài khoản ngân hàng đã liên kết của người dùng và hai thao tác trên đó: đặt mặc định, huỷ liên kết (cần PIN
 * `BANK_ACCOUNT`).
 *
 * Danh sách tải lại mỗi khi màn được focus lại, vì màn liên kết nằm chồng lên và quay về sau khi thêm tài khoản.
 * Khoá idempotency của lần huỷ gắn với đúng tài khoản: nhập sai PIN rồi thử lại vẫn là cùng một thao tác.
 */
export function useBankAccounts() {
  const accounts = useAsync(signal => getBankAccounts(signal), []);
  const { requirePin } = usePinGuard();
  const removeKeys = useRef(new Map<string, string>());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Không tải lại ở lần focus đầu: `useAsync` đã tải khi màn mở.
  const focusedOnce = useRef(false);
  const { reload } = accounts;
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) reload();
      focusedOnce.current = true;
    }, [reload]),
  );

  const run = async (bankAccountId: string, action: () => Promise<unknown>) => {
    if (busyId) return false;
    setBusyId(bankAccountId);
    setError(null);
    try {
      await action();
      accounts.reload();
      return true;
    } catch (e) {
      setError(toUserMessage(e));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const makeDefault = (bankAccountId: string) => run(bankAccountId, () => setDefaultBankAccount(bankAccountId));

  const remove = (bankAccountId: string) =>
    run(bankAccountId, async () => {
      const key = removeKeys.current.get(bankAccountId) ?? generateIdempotencyKey();
      removeKeys.current.set(bankAccountId, key);
      const pinToken = await requirePin('BANK_ACCOUNT', key);
      if (!pinToken) return;
      await removeBankAccount(bankAccountId, key, pinToken);
      removeKeys.current.delete(bankAccountId);
    });

  return {
    accounts: accounts.data ?? NO_ACCOUNTS,
    loaded: accounts.data !== null,
    loading: accounts.loading,
    loadError: accounts.error,
    reload: accounts.reload,
    busyId,
    error,
    makeDefault,
    remove,
  };
}
