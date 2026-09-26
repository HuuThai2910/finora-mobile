import type { IconName } from '@/constants/icons';
import type { LoanProductCatalog } from '@/types/loan';
import { formatMoneyRange } from '@/utils/format';
import { REPAYMENT_METHOD_LABEL } from '../constant';

/** Một dòng thông số trên thẻ sản phẩm. */
export type ProductAttribute = {
  key: 'rate' | 'amount' | 'term' | 'repayment';
  icon: IconName;
  label: string;
  value: string;
  /** Mockup tô xanh riêng giá trị kỳ hạn, các giá trị khác giữ màu chữ đậm. */
  accent: boolean;
};

/** Dữ liệu đã sẵn sàng để vẽ một thẻ ở màn "Sản phẩm vay". */
export type ProductCardView = {
  id: number;
  name: string;
  /** `null` khi admin để trống mô tả — backend cho phép cột này rỗng. */
  description: string | null;
  icon: IconName;
  attributes: ProductAttribute[];
};

/**
 * Chữ thường, bỏ dấu và gộp khoảng trắng để so khớp: người dùng hay gõ không
 * dấu ("tieu dung"), còn tên admin nhập có thể ở dạng Unicode dựng sẵn hoặc tổ
 * hợp. "đ" không tách dấu theo chuẩn Unicode nên phải đổi riêng.
 */
function normalizeForMatch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Contract `LoanProductCatalog` chưa có trường loại sản phẩm (tiêu dùng hay kinh
 * doanh), nên icon chỉ suy từ tên do admin đặt. Icon thuần trang trí — tên sản
 * phẩm mới là thông tin — nên không khớp từ khoá nào thì dùng icon trung tính
 * chứ không đoán tiếp. Khi backend có trường loại sản phẩm thì tra theo trường đó.
 */
const PRODUCT_ICON_RULES: readonly { keywords: readonly string[]; icon: IconName }[] = [
  { keywords: ['kinh doanh'], icon: 'store' },
  { keywords: ['tiêu dùng', 'mua sắm', 'mua trước trả sau'], icon: 'shoppingBag' },
];

const NEUTRAL_PRODUCT_ICON: IconName = 'wallet';

function productIcon(name: string): IconName {
  const normalizedName = normalizeForMatch(name);
  const rule = PRODUCT_ICON_RULES.find(({ keywords }) =>
    keywords.some(keyword => normalizedName.includes(normalizeForMatch(keyword))),
  );
  return rule?.icon ?? NEUTRAL_PRODUCT_ICON;
}

// Backend lưu lãi suất tới 4 chữ số lẻ; hiện đủ để không làm tròn sai con số
// công bố, số chẵn thì Intl tự bỏ phần lẻ ("8" chứ không phải "8,0000").
const percentFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 4 });

/**
 * "8% – 20%/năm"; hai đầu bằng nhau thì "12%/năm". Trường là lãi suất năm theo contract.
 * Màn "Nhập khoản vay" dùng lại để khung lãi suất hiện giống hệt thẻ ở danh sách.
 */
export function formatAnnualRateRange(min: number, max: number): string {
  if (min === max) return `${percentFormat.format(max)}%/năm`;
  return `${percentFormat.format(min)}% – ${percentFormat.format(max)}%/năm`;
}

function formatTermRange(minMonths: number, maxMonths: number): string {
  return minMonths === maxMonths ? `${maxMonths} tháng` : `${minMonths} – ${maxMonths} tháng`;
}

/** Chuyển sản phẩm từ `GET /loan-products` sang dữ liệu thẻ, đúng thứ tự dòng của mockup. */
export function toProductCardView(product: LoanProductCatalog): ProductCardView {
  // Kiểu TS ghi `string` nhưng cột `description` của finora-loan cho phép null.
  const description = product.description?.trim() || null;

  return {
    id: product.id,
    name: product.name,
    description,
    icon: productIcon(product.name),
    attributes: [
      {
        key: 'rate',
        icon: 'percent',
        label: 'Khung lãi suất',
        value: formatAnnualRateRange(product.minAnnualInterestRate, product.maxAnnualInterestRate),
        accent: false,
      },
      {
        key: 'amount',
        icon: 'coins',
        label: 'Khoản vay',
        value: formatMoneyRange(product.minAmount, product.maxAmount),
        accent: false,
      },
      {
        key: 'term',
        icon: 'calendar',
        label: 'Kỳ hạn',
        value: formatTermRange(product.minTermMonths, product.maxTermMonths),
        accent: true,
      },
      {
        key: 'repayment',
        icon: 'fileText',
        label: 'Kiểu tính lãi',
        // Enum mới chưa có nhãn thì hiện nguyên mã thay vì bỏ trống, để còn tra được.
        value: REPAYMENT_METHOD_LABEL[product.repaymentMethod] ?? product.repaymentMethod,
        accent: false,
      },
    ],
  };
}

/**
 * Lọc theo tên ngay trên máy, không phân biệt hoa thường và dấu. Backend chưa có
 * tham số tìm kiếm, nên chỉ lọc trong trang sản phẩm đã tải (`useProducts` lấy
 * 20 sản phẩm đầu — đủ cho danh mục hiện tại).
 */
export function filterProductsByName(
  products: readonly LoanProductCatalog[],
  query: string,
): LoanProductCatalog[] {
  const needle = normalizeForMatch(query);
  if (!needle) return [...products];
  return products.filter(product => normalizeForMatch(product.name).includes(needle));
}
