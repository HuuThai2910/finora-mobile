import type { AutoInvestConfig } from '@/types/invest';
import { formatDong } from '@/utils/format';

/**
 * Bản nháp tiêu chí Auto-Invest trên form và cách kiểm tra nó. Giữ chuỗi để người dùng gõ dở
 * "14," không bị xoá; kiểm tra phía client chỉ để báo sớm — backend vẫn kiểm lại.
 */

export const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const;
export const MIN_AMOUNT = 1_000_000;

export type Draft = { grades: string[]; minRate: string; maxTerm: string; amount: string };
export type DraftErrors = Partial<Record<keyof Draft, string>>;

export const groupDigits = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
export const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const toDraft = (c: AutoInvestConfig): Draft => ({
  grades: c.grades,
  minRate: String(c.minAnnualRate).replace('.', ','),
  maxTerm: String(c.maxTermMonths),
  amount: groupDigits(c.amountPerLoan),
});

export function validateDraft(d: Draft): { errors: DraftErrors; value?: Omit<AutoInvestConfig, 'enabled'> } {
  const errors: DraftErrors = {};
  const minAnnualRate = Number(d.minRate.replace(',', '.'));
  const maxTermMonths = Number(d.maxTerm);
  const amountPerLoan = Number(digitsOnly(d.amount));
  if (d.grades.length === 0) errors.grades = 'Chọn ít nhất một hạng.';
  if (!d.minRate.trim() || !Number.isFinite(minAnnualRate) || minAnnualRate < 0 || minAnnualRate > 100) {
    errors.minRate = 'Nhập lãi suất từ 0 đến 100%/năm.';
  }
  if (!Number.isInteger(maxTermMonths) || maxTermMonths < 1 || maxTermMonths > 120) {
    errors.maxTerm = 'Nhập kỳ hạn từ 1 đến 120 tháng.';
  }
  if (!Number.isInteger(amountPerLoan) || amountPerLoan < MIN_AMOUNT) {
    errors.amount = `Tối thiểu ${formatDong(MIN_AMOUNT)} mỗi khoản.`;
  }
  if (Object.keys(errors).length > 0) return { errors };
  return { errors, value: { grades: d.grades, minAnnualRate, maxTermMonths, amountPerLoan } };
}

/** Lý do Auto-Invest bỏ qua một khoản, viết cho người dùng đọc. */
export function skipLabel(reason?: string): string {
  switch (reason) {
    case 'INSUFFICIENT_FUNDS': return 'Ví không đủ tiền';
    case 'LISTING_FULL': return 'Đã đủ vốn';
    case 'LISTING_CLOSED': return 'Đã đóng';
    case 'ALREADY_INVESTED': return 'Đã tự đầu tư';
    case 'BELOW_MINIMUM': return 'Dưới mức tối thiểu';
    default: return 'Bỏ qua';
  }
}
