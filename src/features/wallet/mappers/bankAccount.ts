import type { Bank } from '@/types/wallet';

/** Bỏ dấu tiếng Việt và viết thường để tìm "vietin", "nong nghiep" vẫn ra ngân hàng có dấu. */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/** Ngân hàng khớp chữ đang tìm theo tên ngắn, tên đầy đủ hoặc mã; ô trống thì khớp tất cả. */
export function matchesBankQuery(bank: Bank, query: string): boolean {
  const needle = fold(query.trim());
  if (!needle) return true;
  return [bank.shortName, bank.name, bank.code].some(text => fold(text).includes(needle));
}

/** Khớp `@Pattern("[0-9]{6,19}")` của Payment. */
export const BANK_ACCOUNT_NUMBER_PATTERN = /^[0-9]{6,19}$/;
export const BANK_ACCOUNT_NUMBER_MAX_LENGTH = 19;
export const BANK_LINK_OTP_LENGTH = 6;

/** Dòng phụ dưới tên ngân hàng: số che và tên chủ tài khoản. */
export function bankAccountSubtitle(account: { accountNumberMasked: string; accountHolderName: string }): string {
  return `${account.accountNumberMasked} · ${account.accountHolderName}`;
}
