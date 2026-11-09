import { formatDate, formatMoneyShort } from './format';

/**
 * Cụm "Vay …" ngắn theo mục đích, để dòng tóm tắt đọc như một câu: "Vay kinh doanh 60 triệu".
 * Mục đích mới backend thêm sau chưa có ở đây thì chỉ ghi "Vay 60 triệu".
 */
const PURPOSE_PHRASE: Record<string, string> = {
  DEBT_CONSOLIDATION: 'hợp nhất nợ',
  CREDIT_CARD: 'trả nợ thẻ',
  HOME_IMPROVEMENT: 'sửa nhà',
  MAJOR_PURCHASE: 'mua sắm',
  MEDICAL: 'chi phí y tế',
  CAR: 'mua, sửa xe',
  SMALL_BUSINESS: 'kinh doanh',
  MOVING: 'chuyển nhà',
  VACATION: 'du lịch',
  EDUCATION: 'học tập',
};

type LoanSummaryInput = {
  /** `LoanPurpose` của Loan (hồ sơ, hợp đồng của người vay). */
  purposeCode?: string | null;
  /** Nhãn mục đích đã viết sẵn (hợp đồng nhà đầu tư chỉ có nhãn); dùng khi không có `purposeCode`. */
  purposeLabel?: string | null;
  amount?: number | null;
  termMonths?: number | null;
  /** ISO-8601; hiện "nộp 09/11/2026" (hoặc động từ khác qua `dateVerb`). */
  date?: string | null;
  dateVerb?: string;
};

/**
 * Dòng tóm tắt người đọc hiểu được thay cho mã kỹ thuật: "Vay kinh doanh 60 triệu · 18 tháng · nộp 09/11/2026".
 * Phần nào thiếu dữ liệu thì bỏ, không bịa. Không có mã mục đích lẫn số tiền thì bắt đầu bằng nhãn mục đích.
 */
export function loanSummaryLine({
  purposeCode,
  purposeLabel,
  amount,
  termMonths,
  date,
  dateVerb = 'nộp',
}: LoanSummaryInput): string {
  const phrase = purposeCode ? PURPOSE_PHRASE[purposeCode] : undefined;
  const money = amount != null && amount > 0 ? formatMoneyShort(amount) : null;
  // Chỉ có nhãn mục đích (phía nhà đầu tư) thì nhãn đứng đầu, không thêm chữ "Vay" trơ trọi: "Vốn kinh doanh nhỏ · 12 tháng".
  const head = phrase || money ? ['Vay', phrase, money].filter(Boolean).join(' ') : null;
  const label = !phrase && purposeLabel?.trim() ? purposeLabel.trim() : null;
  return [
    head,
    label,
    termMonths ? `${termMonths} tháng` : null,
    date ? `${dateVerb} ${formatDate(date)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** "Mã hồ sơ HS-…" / "Mã hợp đồng HĐ-…" cho dòng phụ; không có mã hiển thị thì `null` (không hiện mã kỹ thuật). */
export function displayCodeLine(label: 'Mã hồ sơ' | 'Mã hợp đồng', code?: string | null): string | null {
  const value = code?.trim();
  return value ? `${label} ${value}` : null;
}

/** "Mã hồ sơ HS-… · Mã hợp đồng HĐ-…", bỏ phần chưa có mã; không còn gì thì `null`. */
export function displayCodesLine(applicationCode?: string | null, contractCode?: string | null): string | null {
  const parts = [displayCodeLine('Mã hồ sơ', applicationCode), displayCodeLine('Mã hợp đồng', contractCode)];
  const text = parts.filter(Boolean).join(' · ');
  return text || null;
}

/**
 * Loan gửi mục đích dạng "Nhãn: phương án người vay tự viết". Phần nhãn dùng cho tiêu đề, phần sau dùng cho dòng mô
 * tả; không có dấu hai chấm thì cả chuỗi là nhãn.
 */
export function splitPurpose(purpose?: string | null): { label: string | null; detail: string | null } {
  const value = purpose?.trim();
  if (!value) return { label: null, detail: null };
  const colon = value.indexOf(':');
  if (colon < 0) return { label: value, detail: null };
  return { label: value.slice(0, colon).trim() || null, detail: value.slice(colon + 1).trim() || null };
}

/** Nhãn `LoanPurpose` của Loan → mã, cho chỗ chỉ nhận nhãn (danh mục, hợp đồng nhà đầu tư) mà cần chọn biểu tượng. */
const PURPOSE_CODE_BY_LABEL: Record<string, string> = {
  'Hợp nhất các khoản nợ': 'DEBT_CONSOLIDATION',
  'Thanh toán dư nợ thẻ tín dụng': 'CREDIT_CARD',
  'Sửa chữa nhà': 'HOME_IMPROVEMENT',
  'Mua sắm tài sản có giá trị': 'MAJOR_PURCHASE',
  'Chi phí y tế': 'MEDICAL',
  'Mua hoặc sửa chữa xe': 'CAR',
  'Vốn kinh doanh nhỏ': 'SMALL_BUSINESS',
  'Chi phí chuyển nơi ở': 'MOVING',
  'Du lịch': 'VACATION',
  'Chi phí giáo dục': 'EDUCATION',
  'Mục đích khác': 'OTHER',
};

/** Mã mục đích suy từ nhãn; nhãn lạ (đổi tên, dữ liệu mẫu) thì `null` để dùng biểu tượng chung. */
export function purposeCodeFromLabel(label?: string | null): string | null {
  return label ? PURPOSE_CODE_BY_LABEL[label.trim()] ?? null : null;
}
