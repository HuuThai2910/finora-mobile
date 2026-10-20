import { useState } from 'react';
import type { CreateWithdrawalRequest, WithdrawalPolicy } from '@/types/wallet';
import {
  validateWithdrawForm,
  type WithdrawFormErrors,
  type WithdrawFormField,
  type WithdrawFormValues,
} from '../schemas/withdrawalForm';

const EMPTY_FORM: WithdrawFormValues = { bankCode: null, accountNumber: '', accountHolderName: '', amount: null };

/**
 * State của form rút tiền: giá trị từng ô, lỗi theo ô sau lần bấm gửi và bước kiểm tra trả về request đã chuẩn hoá.
 *
 * State nằm cục bộ ở form vì chỉ màn này dùng; rời màn là bỏ, số tài khoản không được giữ ở nơi nào khác.
 * `onEdit` báo cho màn biết người dùng vừa sửa form, để xoá lỗi của lần gửi trước.
 */
export function useWithdrawForm(policy: WithdrawalPolicy, onEdit: () => void) {
  const [values, setValues] = useState<WithdrawFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<WithdrawFormErrors>({});

  const change = <K extends WithdrawFormField>(field: K, value: WithdrawFormValues[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
    onEdit();
  };

  /** Kiểm toàn bộ form; hợp lệ thì trả request để gửi, không thì hiện lỗi tại từng ô và trả `null`. */
  const toRequest = (): CreateWithdrawalRequest | null => {
    const result = validateWithdrawForm(values, policy);
    setErrors(result.errors);
    return result.request;
  };

  return { values, errors, change, toRequest };
}
