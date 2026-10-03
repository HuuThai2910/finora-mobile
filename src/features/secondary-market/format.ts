import { formatMoneyShort } from '@/utils/format';
import { FEE_RATE_PERCENT } from './constant';

const PRICE_FORMAT = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Giá luôn đủ một chữ số lẻ để cột giá trên thang thẳng hàng: 97 → "97,0%". */
export const formatBookPrice = (price: number): string => `${PRICE_FORMAT.format(price)}%`;

/**
 * Tiền **tạm tính** của một lệnh, chỉ để người dùng hình dung trước khi đặt.
 *
 * Cùng định nghĩa nghiệp vụ của backend (INV-E2): tiền mỗi Note = giá × dư nợ gốc còn lại. Dùng dư
 * nợ lớn nhất của đợt nên với lệnh mua đây là mức trần; số chính thức do backend chốt lúc giữ tiền
 * và lúc khớp, màn hình không dùng con số này để hạch toán.
 */
export function estimateOrder(referenceOutstanding: number, price: number, quantity: number) {
  const perNote = Math.round((referenceOutstanding * price) / 100);
  const gross = perNote * quantity;
  const fee = Math.floor((gross * FEE_RATE_PERCENT) / 100);
  return { gross, fee, net: gross - fee };
}

/** Làm tròn về đúng bước 0,1 để tránh 97.49999 khi cộng trừ số thực. */
export const roundPrice = (price: number): number => Math.round(price * 10) / 10;

/** Câu cảnh báo nợ xấu từ backend có thể thiếu dấu chấm cuối; thêm vào để nối câu sau cho đúng. */
export const asSentence = (text: string): string => (/[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);

/** Mệnh giá Note viết gọn, số và đơn vị dính nhau để không bị ngắt dòng giữa "1" và "triệu". */
export const formatDenomination = (amount: number): string => formatMoneyShort(amount).replace(/ /g, ' ');
