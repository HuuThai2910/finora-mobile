import type { CreateWithdrawalRequest, WithdrawalPolicy } from '@/types/wallet';
import { formatDong } from '@/utils/format';

/** Giá trị form rút tiền; số tiền là số nguyên đồng, `null` khi ô còn trống. */
export type WithdrawFormValues = {
  bankCode: string | null;
  accountNumber: string;
  accountHolderName: string;
  amount: number | null;
};

export type WithdrawFormField = keyof WithdrawFormValues;
export type WithdrawFormErrors = Partial<Record<WithdrawFormField, string>>;

/** Khớp `@Pattern("[0-9]{6,19}")` của `CreateWithdrawalRequest` ở Payment. */
const ACCOUNT_NUMBER_PATTERN = /^[0-9]{6,19}$/;
export const ACCOUNT_NUMBER_MAX_LENGTH = 19;

/** Khớp `@Size(min = 2, max = 100)` của tên chủ tài khoản. */
const HOLDER_MIN_LENGTH = 2;
export const HOLDER_MAX_LENGTH = 100;

/**
 * Chuẩn hoá tên chủ tài khoản như `normalizeHolder` của Payment: bỏ khoảng trắng hai đầu, gộp khoảng trắng liền
 * nhau, viết hoa. Ghép dấu về dạng dựng sẵn (NFC) để chữ có dấu gõ từ bàn phím tách dấu vẫn là một chữ cái.
 */
export function normalizeHolderName(raw: string): string {
  return raw.normalize('NFC').trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Payment chỉ nhận chữ cái và khoảng trắng (`[\p{L} ]+`). Nhận ra chữ cái bằng việc dạng hoa khác dạng thường thay
 * vì `\p{L}`, để không phụ thuộc engine JS có hỗ trợ Unicode property escape; mọi chữ cái tiếng Việt đều có hai dạng.
 */
function isLettersAndSpaces(value: string): boolean {
  return [...value].every(ch => ch === ' ' || ch.toLowerCase() !== ch.toUpperCase());
}

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

function holderError(holder: string): string | undefined {
  if (holder.length === 0) return 'Nhập tên chủ tài khoản.';
  if (holder.length < HOLDER_MIN_LENGTH) return `Tên chủ tài khoản tối thiểu ${HOLDER_MIN_LENGTH} ký tự.`;
  if (holder.length > HOLDER_MAX_LENGTH) return `Tên chủ tài khoản tối đa ${HOLDER_MAX_LENGTH} ký tự.`;
  if (!isLettersAndSpaces(holder)) return 'Tên chủ tài khoản chỉ gồm chữ cái và khoảng trắng.';
  return undefined;
}

/**
 * Kiểm form theo đúng ràng buộc của Payment để báo lỗi ngay tại ô; Payment vẫn kiểm lại và là nơi quyết định.
 * Hợp lệ thì trả request đã chuẩn hoá (tên viết hoa, số tài khoản không khoảng trắng) để gửi đi.
 */
export function validateWithdrawForm(
  values: WithdrawFormValues,
  policy: WithdrawalPolicy,
): { errors: WithdrawFormErrors; request: CreateWithdrawalRequest | null } {
  const errors: WithdrawFormErrors = {};
  const bank = policy.banks.find(item => item.code === values.bankCode);
  if (!bank) errors.bankCode = 'Chọn ngân hàng nhận.';

  const accountNumber = values.accountNumber.trim();
  if (!ACCOUNT_NUMBER_PATTERN.test(accountNumber)) errors.accountNumber = 'Số tài khoản gồm 6–19 chữ số.';

  const holder = normalizeHolderName(values.accountHolderName);
  const holderMessage = holderError(holder);
  if (holderMessage) errors.accountHolderName = holderMessage;

  const amountMessage = amountError(values.amount, policy);
  if (amountMessage) errors.amount = amountMessage;

  if (!bank || values.amount === null || Object.keys(errors).length > 0) return { errors, request: null };
  return {
    errors,
    request: { amount: values.amount, bankCode: bank.code, accountNumber, accountHolderName: holder },
  };
}
