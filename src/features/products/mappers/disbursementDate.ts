const ISO_DATE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const DISPLAY_DATE = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/;

const pad2 = (value: number): string => value.toString().padStart(2, '0');

function isoDate(year: number, month: number, day: number): string | null {
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year
    || check.getUTCMonth() !== month - 1
    || check.getUTCDate() !== day
  ) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Ngày lịch tại thiết bị, không qua UTC để tránh đổi ngày ở múi giờ Việt Nam. */
export function localTodayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/**
 * Chuẩn hóa ngày người dùng nhập sang `yyyy-MM-dd` cho backend.
 *
 * Chấp nhận `dd/MM/yyyy`; dạng ngắn `d/M` dùng năm hiện tại, hoặc năm kế tiếp
 * nếu ngày đó đã qua. Dạng ISO vẫn được giữ để tương thích navigation cũ.
 */
export function normalizeDisbursementDate(value: string, today = localTodayIso()): string | null {
  const trimmed = value.trim();
  const iso = ISO_DATE.exec(trimmed);
  if (iso) return isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const display = DISPLAY_DATE.exec(trimmed);
  if (!display) return null;
  const day = Number(display[1]);
  const month = Number(display[2]);
  const explicitYear = display[3] ? Number(display[3]) : null;
  let year = explicitYear ?? Number(today.slice(0, 4));
  let normalized = isoDate(year, month, day);
  if (!normalized) return null;
  if (explicitYear === null && normalized < today) {
    year += 1;
    normalized = isoDate(year, month, day);
  }
  return normalized;
}

/** Giá trị ISO trong state được trình bày theo cách đọc ngày quen thuộc của người dùng. */
export function displayDisbursementDate(value: string): string {
  const iso = ISO_DATE.exec(value.trim());
  if (!iso) return value;
  const normalized = isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  if (!normalized) return value;
  const [year, month, day] = normalized.split('-');
  return `${day}/${month}/${year}`;
}
