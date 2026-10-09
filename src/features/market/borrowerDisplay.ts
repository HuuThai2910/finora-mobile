import type { BorrowerKycStatus, BorrowerRuleResult, LoanDecisionSource } from '@/types/invest';
import { formatDong, formatPercentValue } from '@/utils/format';

/**
 * Nhãn và cách viết số của hồ sơ người vay. Chỉ đổi cách hiển thị, không tính lại con số nào:
 * mọi giá trị đã do Loan/AI tính sẵn.
 */

/** Theo enum `HomeOwnership` của Loan; bảng luật của AI dùng cùng mã. */
export const HOME_OWNERSHIP_LABEL: Record<string, string> = {
  OWN: 'Nhà thuộc sở hữu',
  MORTGAGE: 'Đang trả góp nhà',
  RENT: 'Đi thuê',
  OTHER: 'Khác',
};

/** Theo enum `EducationLevel` của Loan. */
export const EDUCATION_LABEL: Record<string, string> = {
  HIGH_SCHOOL: 'Trung học phổ thông',
  COLLEGE: 'Cao đẳng',
  UNIVERSITY: 'Đại học',
  POSTGRADUATE: 'Sau đại học',
  OTHER: 'Khác',
};

export const KYC_LABEL: Record<BorrowerKycStatus, string> = {
  VERIFIED: 'Đã xác minh',
  PENDING: 'Chờ xác minh',
  PROCESSING: 'Đang xác minh',
  REJECTED: 'Bị từ chối',
  EXPIRED: 'Đã hết hạn',
  UNKNOWN: 'Không rõ',
};

export const DECISION_SOURCE_LABEL: Record<LoanDecisionSource, string> = {
  AI_POLICY: 'Tự động theo chính sách',
  ADMIN: 'Chuyên viên thẩm định',
  UNKNOWN: 'Không rõ',
};

/** Mục đích vay trong bảng luật là mã chữ thường của AI (`LoanPurpose.aiValue` bên Loan). */
const AI_PURPOSE_LABEL: Record<string, string> = {
  debt_consolidation: 'Hợp nhất các khoản nợ',
  credit_card: 'Thanh toán dư nợ thẻ tín dụng',
  home_improvement: 'Sửa chữa nhà',
  major_purchase: 'Mua sắm tài sản có giá trị',
  medical: 'Chi phí y tế',
  car: 'Mua hoặc sửa chữa xe',
  small_business: 'Vốn kinh doanh nhỏ',
  moving: 'Chi phí chuyển nơi ở',
  vacation: 'Du lịch',
  education: 'Chi phí giáo dục',
  other: 'Mục đích khác',
};

const VERIFICATION_LABEL: Record<string, string> = {
  Verified: 'Đã xác minh',
  'Source Verified': 'Đã xác minh nguồn',
  'Not Verified': 'Chưa xác minh',
};

const NUMBER = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const plain = (value: number) => NUMBER.format(value);

/** Điểm đánh giá, điểm CIC: 68.92 → "68,92". */
export const formatScore = plain;

/**
 * Đơn vị từng trường luật, chép từ danh mục trường của AI (`finora-ai/app/services/credit/truong_du_lieu.py`).
 * Trường tỷ lệ (`la_ty_le`) là số 0..1 nên nhân 100; `dti` và `ty_le_su_dung_the` đã là phần trăm.
 * Trường không có ở đây (luật admin mới thêm) hiện số thô, không đoán đơn vị.
 */
const NUMBER_FIELDS: Record<string, (value: number) => string> = {
  annual_inc: formatDong,
  loan_amnt: formatDong,
  installment: formatDong,
  tong_du_no: formatDong,
  du_no_the_tin_dung: formatDong,
  person_age: value => `${plain(value)} tuổi`,
  emp_length_years: value => `${plain(value)} năm`,
  dti: value => formatPercentValue(value),
  ty_le_su_dung_the: value => formatPercentValue(value),
  term_months: value => `${plain(value)} tháng`,
  cic_score: value => `${plain(value)} điểm`,
  so_lan_tre_han: value => `${plain(value)} lần`,
  thang_tu_tre_gan_nhat: value => `${plain(value)} tháng`,
  nhom_no_cao_nhat: value => `Nhóm ${plain(value)}`,
  so_lan_tra_cuu: value => `${plain(value)} lần`,
  so_hop_dong_dang_co: value => `${plain(value)} hợp đồng`,
  so_thang_quan_he: value => `${plain(value)} tháng`,
  ty_le_tra_no_thang: value => formatPercentValue(value * 100),
  loan_to_income: value => formatPercentValue(value * 100),
  ty_le_du_no_thu_nhap: value => formatPercentValue(value * 100),
};

const TEXT_FIELDS: Record<string, Record<string, string>> = {
  home_ownership: HOME_OWNERSHIP_LABEL,
  purpose: AI_PURPOSE_LABEL,
  verification_status: VERIFICATION_LABEL,
};

/** Giá trị một luật đã đọc, viết theo đơn vị của trường. */
export function formatRuleValue(field: string, value: number | string): string {
  if (typeof value === 'number') return (NUMBER_FIELDS[field] ?? plain)(value);
  return TEXT_FIELDS[field]?.[value] ?? value;
}

/**
 * Giá trị một trường lấy từ bảng luật: chỗ duy nhất có điểm CIC, số lần tra cứu CIC và tỷ lệ kỳ trả
 * trên thu nhập (Loan không lưu báo cáo CIC). Luật do admin cấu hình nên có thể vắng:
 * `undefined` là không có luật đọc trường đó, `null` là có luật nhưng thiếu dữ liệu.
 */
export function ruleValue(rules: BorrowerRuleResult[], field: string): number | string | null | undefined {
  const rule = rules.find(item => item.field === field);
  if (!rule) return undefined;
  return rule.missingData ? null : rule.value;
}

/**
 * Mô tả luật admin viết theo mẫu "Tên chỉ số — cách đọc" (vd "Điểm tín dụng CIC — lịch sử trả nợ…").
 * Tách hai phần để tên in đậm, phần giải thích in nhỏ; không có dấu gạch thì giữ nguyên cả câu.
 */
export function splitRuleDescription(description: string): { title: string; hint: string | null } {
  const at = description.indexOf(' — ');
  if (at <= 0) return { title: description.trim(), hint: null };
  const hint = description.slice(at + 3).trim();
  return {
    title: description.slice(0, at).trim(),
    hint: hint ? hint.charAt(0).toUpperCase() + hint.slice(1) : null,
  };
}

/** Thâm niên theo tháng → "10 năm", "2 năm 3 tháng", "8 tháng". */
export function formatEmployment(months: number | null): string {
  if (months == null) return 'Chưa cung cấp';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} tháng`;
  return rest === 0 ? `${years} năm` : `${years} năm ${rest} tháng`;
}
