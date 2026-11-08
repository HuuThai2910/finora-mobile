import type { BankAccount, CreateWithdrawalRequest, WithdrawalPolicy } from '@/types/wallet';
import { formatDong } from '@/utils/format';

/** Giá trị form rút tiền; số tiền là số nguyên đồng, `null` khi ô còn trống. */
export type WithdrawFormValues = {
  /** Tài khoản đã liên kết nhận tiền (BL-001). */
  bankAccountId: string | null;
  amount: number | null;
};

export type WithdrawFormField = keyof WithdrawFormValues;
export type WithdrawFormErrors = Partial<Record<WithdrawFormField, string>>;

/** Số tiền lớn nhất rút được lúc này: không quá hạn mức còn lại hôm nay và số dư khả dụng sau khi trừ phí. */
export function maxWithdrawable(policy: WithdrawalPolicy): number {
  return Math.max(0, Math.min(policy.remainingToday, policy.availableBalance - policy.feeAmount));
}

/** Lý do chưa tạo được lệnh rút nào lúc này; `null` khi còn rút được ít nhất mức tối thiểu. */
export function withdrawBlockedReason(policy: WithdrawalPolicy): string | null {
  if (policy.remainingToday <= 0) {
    return `Hôm nay bạn đã dùng hết hạn mức rút ${formatDong(policy.dailyLimit)}. Hạn mức được tính lại theo ngày (giờ Việt Nam).`;
  }
  if (policy.remainingToday < policy.minimumAmount) {
    return `Hạn mức còn lại hôm nay (${formatDong(policy.remainingToday)}) thấp hơn mức rút tối thiểu ${formatDong(policy.minimumAmount)}.`;
  }
  if (policy.availableBalance - policy.feeAmount < policy.minimumAmount) {
    return `Số dư khả dụng chưa đủ mức rút tối thiểu ${formatDong(policy.minimumAmount)}.`;
  }
  return null;
}

function amountError(amount: number | null, policy: WithdrawalPolicy): string | undefined {
  if (amount === null || amount <= 0) return 'Nhập số tiền cần rút.';
  if (!Number.isInteger(amount)) return 'Số tiền rút phải là số nguyên đồng.';
  if (amount < policy.minimumAmount) return `Mỗi lần rút tối thiểu ${formatDong(policy.minimumAmount)}.`;
  if (amount > policy.remainingToday) return `Hôm nay bạn còn được rút tối đa ${formatDong(policy.remainingToday)}.`;
  if (amount + policy.feeAmount > policy.availableBalance) {
    return policy.feeAmount > 0
      ? `Số tiền cộng phí ${formatDong(policy.feeAmount)} vượt số dư khả dụng ${formatDong(policy.availableBalance)}.`
      : `Vượt số dư khả dụng ${formatDong(policy.availableBalance)}.`;
  }
  return undefined;
}

/**
 * Kiểm form theo đúng ràng buộc của Payment để báo lỗi ngay tại ô; Payment vẫn kiểm lại và là nơi quyết định (tài
 * khoản còn liên kết, hạn mức, số dư). Hợp lệ thì trả request để gửi đi.
 */
export function validateWithdrawForm(
  values: WithdrawFormValues,
  policy: WithdrawalPolicy,
  accounts: readonly BankAccount[],
): { errors: WithdrawFormErrors; request: CreateWithdrawalRequest | null } {
  const errors: WithdrawFormErrors = {};
  const account = accounts.find(item => item.bankAccountId === values.bankAccountId);
  if (!account) errors.bankAccountId = 'Chọn tài khoản nhận tiền.';

  const amountMessage = amountError(values.amount, policy);
  if (amountMessage) errors.amount = amountMessage;

  if (!account || values.amount === null || Object.keys(errors).length > 0) return { errors, request: null };
  return { errors, request: { amount: values.amount, bankAccountId: account.bankAccountId } };
}
