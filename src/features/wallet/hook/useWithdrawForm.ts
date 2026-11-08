import { useEffect, useState } from 'react';
import type { BankAccount, CreateWithdrawalRequest, WithdrawalPolicy } from '@/types/wallet';
import {
  validateWithdrawForm,
  type WithdrawFormErrors,
  type WithdrawFormField,
  type WithdrawFormValues,
} from '../schemas/withdrawalForm';

const EMPTY_FORM: WithdrawFormValues = { bankAccountId: null, amount: null };

/**
 * State của form rút tiền: tài khoản nhận đã chọn, số tiền, lỗi theo ô sau lần bấm gửi và bước kiểm tra trả về request.
 *
 * State nằm cục bộ ở form vì chỉ màn này dùng. Chưa chọn tài khoản thì tự chọn tài khoản mặc định khi danh sách tải
 * xong; tài khoản đang chọn bị huỷ liên kết (danh sách tải lại) thì bỏ chọn. `onEdit` báo cho màn biết người dùng vừa
 * sửa form, để xoá lỗi của lần gửi trước.
 */
export function useWithdrawForm(policy: WithdrawalPolicy, accounts: readonly BankAccount[], onEdit: () => void) {
  const [values, setValues] = useState<WithdrawFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<WithdrawFormErrors>({});

  // Đồng bộ lựa chọn với danh sách tài khoản vừa tải: đây là state dẫn xuất từ dữ liệu ngoài, không phải thao tác người dùng.
  useEffect(() => {
    setValues(prev => {
      const stillLinked = accounts.some(item => item.bankAccountId === prev.bankAccountId);
      if (stillLinked) return prev;
      const fallback = (accounts.find(item => item.defaultAccount) ?? accounts[0])?.bankAccountId ?? null;
      return fallback === prev.bankAccountId ? prev : { ...prev, bankAccountId: fallback };
    });
  }, [accounts]);

  const change = <K extends WithdrawFormField>(field: K, value: WithdrawFormValues[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
    onEdit();
  };

  /** Kiểm toàn bộ form; hợp lệ thì trả request để gửi, không thì hiện lỗi tại từng ô và trả `null`. */
  const toRequest = (): CreateWithdrawalRequest | null => {
    const result = validateWithdrawForm(values, policy, accounts);
    setErrors(result.errors);
    return result.request;
  };

  return { values, errors, change, toRequest };
}
