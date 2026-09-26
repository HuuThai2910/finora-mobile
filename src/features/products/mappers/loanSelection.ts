import type { LoanProductCatalog } from '@/types/loan';
import { formatAnnualRate, formatMoneyShort } from '@/utils/format';
import { REPAYMENT_METHOD_LABEL, termOptions } from '../constant';
import { formatAnnualRateRange } from './productCard';

/** Một mốc chọn nhanh (chip) dưới bộ tăng/giảm. */
export type QuickPick = { value: number; label: string };

/** Một ô thông số trong thẻ điều khoản ở đầu màn "Nhập khoản vay". */
export type LoanTermsItem = {
  key: 'baseRate' | 'rateRange' | 'maxTerm' | 'maxAmount';
  label: string;
  value: string;
  /** Mockup tô xanh lá riêng lãi suất cơ sở, các ô khác giữ màu chữ đậm. */
  accent: boolean;
};

export type LoanTermsView = {
  /** Cách trả của Product — thay cho nhãn quảng cáo "Khoản vay minh bạch" của mockup. */
  repaymentLabel: string;
  items: LoanTermsItem[];
};

/** Tối đa bốn chip: vừa một hàng ở máy 360pt mà chữ vẫn không phải thu nhỏ. */
const MAX_QUICK_PICKS = 4;

const thousandFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 });

/**
 * Nhãn chip số tiền: từ 1 triệu trở lên viết gọn như thẻ sản phẩm ("20 triệu",
 * "1,5 tỷ"); dưới 1 triệu thì "500 nghìn" thay cho "500.000 đ" quá dài so với
 * chip ở máy 360pt.
 */
function amountChipLabel(value: number): string {
  if (value < 1_000_000 && value % 1_000 === 0) return `${thousandFormat.format(value / 1_000)} nghìn`;
  return formatMoneyShort(value);
}

/**
 * Thẻ điều khoản đầu màn. Mọi con số lấy nguyên từ `GET /loan-products/{id}`;
 * chữ "Lãi suất cơ sở" giữ đúng thuật ngữ của `rateNotice` do backend trả về.
 */
export function toLoanTermsView(product: LoanProductCatalog): LoanTermsView {
  return {
    // Enum mới chưa có nhãn thì hiện nguyên mã (như thẻ ở danh sách) để còn tra được.
    repaymentLabel: REPAYMENT_METHOD_LABEL[product.repaymentMethod] ?? product.repaymentMethod,
    items: [
      {
        key: 'baseRate',
        label: 'Lãi suất cơ sở',
        value: formatAnnualRate(product.annualInterestRate),
        accent: true,
      },
      {
        key: 'rateRange',
        label: 'Khung có thể áp dụng',
        value: formatAnnualRateRange(product.minAnnualInterestRate, product.maxAnnualInterestRate),
        accent: false,
      },
      { key: 'maxTerm', label: 'Kỳ hạn tối đa', value: `${product.maxTermMonths} tháng`, accent: false },
      { key: 'maxAmount', label: 'Hạn mức tối đa', value: formatMoneyShort(product.maxAmount), accent: false },
    ],
  };
}

/**
 * Các số "tròn" theo dãy 1–2–5 (1, 2, 5, 10, 20, 50 triệu…) nằm hẳn trong
 * (min, max) và chia hết cho nhịp +/−, xếp tăng dần.
 */
function roundAmountsBetween(min: number, max: number, step: number): number[] {
  const result: number[] = [];
  for (let magnitude = 1; magnitude < max; magnitude *= 10) {
    for (const multiple of [1, 2, 5]) {
      const value = multiple * magnitude;
      if (value > min && value < max && value % step === 0) result.push(value);
    }
  }
  return result;
}

/**
 * Chip số tiền: hai đầu khoảng cho phép, cộng số tròn 1–2–5 gần mốc 1/4 và 1/2
 * khoảng nhất (hoà thì lấy số nhỏ). Sản phẩm 10–100 triệu ra 10 · 20 · 50 · 100
 * triệu, thay cho 10 · 33 · 55 · 100 của cách làm tròn cũ — người vay hay nghĩ
 * theo số tròn, và số điền sẵn 50 triệu trùng một chip. Không đủ số tròn thì ít
 * chip hơn; khoảng chỉ có một giá trị thì không cần chip.
 */
export function amountQuickPicks(min: number, max: number, step: number): QuickPick[] {
  if (min >= max) return [];
  const candidates = roundAmountsBetween(min, max, step);
  const picked = new Set<number>([min, max]);

  for (const share of [0.25, 0.5]) {
    const target = min + (max - min) * share;
    let nearest: number | null = null;
    for (const value of candidates) {
      if (picked.has(value)) continue;
      if (nearest === null || Math.abs(value - target) < Math.abs(nearest - target)) nearest = value;
    }
    if (nearest !== null) picked.add(nearest);
  }

  return [...picked].sort((a, b) => a - b).map(value => ({ value, label: amountChipLabel(value) }));
}

/**
 * Chip kỳ hạn: các mốc quen thuộc của `termOptions` (6/12/18/24/30/36/48 tháng)
 * trong khoảng của Product. Nhiều hơn bốn mốc thì giữ mốc đầu, mốc cuối và hai
 * mốc cách đều theo vị trí ở giữa (6–60 tháng ra 6 · 18 · 30 · 48).
 */
export function termQuickPicks(min: number, max: number): QuickPick[] {
  if (min >= max) return [];
  const options = termOptions(min, max);
  if (options.length <= MAX_QUICK_PICKS) return options;

  const last = options.length - 1;
  const indexes = new Set(
    Array.from({ length: MAX_QUICK_PICKS }, (_, i) => Math.round((i * last) / (MAX_QUICK_PICKS - 1))),
  );
  return [...indexes].map(index => options[index]);
}
