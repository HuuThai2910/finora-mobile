import type { IconName } from '@/constants/icons';
import { formatMoneyRange } from '@/utils/format';
import type { listVentoPackages } from '../api';

/** Một gói vay ưu đãi đúng như nguồn dữ liệu trả về (hiện là dữ liệu demo VENTO). */
export type VentoPackage = Awaited<ReturnType<typeof listVentoPackages>>[number];

/** Một cột thông số ở hàng dưới của thẻ gói. */
export type PackageFact = {
  key: 'amount' | 'term' | 'form';
  icon: IconName;
  label: string;
  value: string;
};

/** Dữ liệu đã sẵn sàng để vẽ một thẻ ở màn "Gói vay ưu đãi". */
export type PackageCardView = {
  code: string;
  name: string;
  /** "PVHP · Dành riêng sinh viên" — mã gói · đối tượng, như mockup. */
  subtitle: string;
  icon: IconName;
  rate: string;
  facts: PackageFact[];
  /** Cả thẻ là một nút, nên nhãn đọc gói đủ mọi thông tin hiện trên thẻ. */
  accessibilityLabel: string;
};

/**
 * Gói vay ưu đãi chỉ có trong bản demo, không có trường loại sản phẩm, nên icon
 * tra theo mã gói. Icon thuần trang trí (tên gói mới là thông tin), mã lạ thì
 * dùng icon trung tính chứ không đoán.
 */
const PACKAGE_ICON: Record<string, IconName> = {
  PVHP: 'graduationCap',
  PVMDT: 'phone',
  PLVN: 'users',
};
const NEUTRAL_PACKAGE_ICON: IconName = 'coins';

/**
 * Nối hai đầu khoảng bằng khoảng trắng không ngắt: cột thông số hẹp (~95pt ở màn
 * 360pt) mà xuống dòng thì chỉ được rơi trước đơn vị ("10 – 500 / triệu"), không
 * được tách hai con số của khoảng ra hai dòng.
 */
const NBSP = String.fromCharCode(0xa0);
const keepRangeTogether = (text: string) => text.replace(/ – /g, `${NBSP}–${NBSP}`);

/**
 * Dính hai chữ cuối vào nhau để khi phải xuống dòng không còn một chữ mồ côi
 * ("Dành riêng sinh / viên" thành "Dành riêng / sinh viên").
 */
const avoidOrphan = (text: string) => text.replace(/ (\S+)$/, `${NBSP}$1`);

function formatTermRange(minMonths: number, maxMonths: number): string {
  return minMonths === maxMonths ? `${maxMonths} tháng` : `${minMonths} – ${maxMonths} tháng`;
}

/** Chuyển một gói sang dữ liệu thẻ, đúng thứ tự cột của mockup. */
export function toPackageCardView(pkg: VentoPackage): PackageCardView {
  const amount = formatMoneyRange(pkg.minAmount, pkg.maxAmount);
  const term = formatTermRange(pkg.minTermMonths, pkg.maxTermMonths);

  return {
    code: pkg.code,
    name: avoidOrphan(pkg.name),
    subtitle: `${pkg.code} · ${avoidOrphan(pkg.audience)}`,
    icon: PACKAGE_ICON[pkg.code] ?? NEUTRAL_PACKAGE_ICON,
    rate: pkg.rateLabel,
    facts: [
      { key: 'amount', icon: 'coins', label: 'Hạn mức', value: keepRangeTogether(amount) },
      { key: 'term', icon: 'clock', label: 'Thời hạn', value: keepRangeTogether(term) },
      { key: 'form', icon: 'receipt', label: 'Hình thức', value: avoidOrphan(pkg.form) },
    ],
    // "/năm" đọc thành "gạch chéo năm" trên trình đọc màn hình, nên đổi thành lời.
    accessibilityLabel: [
      pkg.name,
      `mã ${pkg.code}`,
      pkg.audience,
      `lãi suất ${pkg.rateLabel.replace('/năm', ' một năm')}`,
      `hạn mức ${amount}`,
      `thời hạn ${term}`,
      `hình thức ${pkg.form}`,
    ].join(', '),
  };
}
