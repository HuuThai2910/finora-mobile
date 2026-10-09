/** Ngày lịch tách rời, tháng đếm từ 1 — dùng cho bộ chọn ngày dạng bánh xe. */
export type DateParts = { year: number; month: number; day: number };

/** Số ngày của một tháng; tháng 2 tự tính năm nhuận. */
export const daysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();

/** "2026-10-25" → { 2026, 10, 25 }; tách chuỗi, không qua UTC để không lệch ngày ở múi giờ âm. */
export function toDateParts(value: string): DateParts {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
}

/** Ghép lại dạng `yyyy-MM-dd` mà Loan Service nhận. */
export const fromDateParts = ({ year, month, day }: DateParts): string =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/** Cộng thêm số ngày theo lịch của máy: "2026-10-25" + 1 → "2026-10-26". */
export function addDays(value: string, days: number): string {
  const { year, month, day } = toDateParts(value);
  const next = new Date(year, month - 1, day + days);
  return fromDateParts({ year: next.getFullYear(), month: next.getMonth() + 1, day: next.getDate() });
}

/** Đổi tháng/năm mà ngày đang chọn vượt số ngày của tháng mới (31 → tháng 30 ngày) thì kéo về ngày cuối tháng. */
export const clampDay = (parts: DateParts): DateParts => ({
  ...parts,
  day: Math.min(parts.day, daysInMonth(parts.year, parts.month)),
});
