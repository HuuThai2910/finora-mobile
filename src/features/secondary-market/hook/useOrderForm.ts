import { useState } from 'react';
import type { OrderSide, PlaceOrderInput } from '@/types/orderBook';
import { PRICE_MAX, PRICE_MIN, PRICE_STEP, QUANTITY_MAX } from '../constant';
import { roundPrice } from '../format';

/** Hiện giá bằng dấu phẩy thập phân như cách người Việt viết: 97.5 → "97,5". */
const priceText = (price: number) => price.toFixed(1).replace('.', ',');

/** Đọc ô giá: nhận cả "97,5" lẫn "97.5"; chuỗi không phải số thì trả NaN. */
const parsePrice = (text: string) => Number(text.trim().replace(',', '.'));

type Options = {
  side: OrderSide;
  initialPrice: number;
  /** Số Note còn bán được; null khi chưa tải xong vị thế. */
  freeNotes: number | null;
  defaulted: boolean;
};

/**
 * State và kiểm tra của form đặt lệnh. Giữ giá và số Note dạng chuỗi để người dùng gõ dở không bị
 * xoá; kiểm tra phía client chỉ để báo sớm — backend vẫn kiểm lại mọi điều kiện.
 */
export function useOrderForm({ side: initialSide, initialPrice, freeNotes, defaulted }: Options) {
  const [side, setSide] = useState<OrderSide>(initialSide);
  const [priceInput, setPriceInput] = useState(priceText(initialPrice));
  const [quantityInput, setQuantityInput] = useState('1');
  const [acknowledged, setAcknowledged] = useState(false);

  const price = parsePrice(priceInput);
  const quantity = Number(quantityInput.trim());

  const priceError = (() => {
    if (!Number.isFinite(price)) return 'Nhập giá theo % dư nợ, ví dụ 97,5.';
    if (price < PRICE_MIN || price > PRICE_MAX) return 'Giá phải từ 0,1% tới 100% dư nợ gốc.';
    if (Math.abs(roundPrice(price) - price) > 1e-9) return 'Giá chỉ đặt theo bước 0,1%.';
    return null;
  })();

  const quantityError = (() => {
    if (!Number.isInteger(quantity) || quantity < 1) return 'Nhập số Note từ 1 trở lên.';
    if (quantity > QUANTITY_MAX) return 'Một lệnh đặt tối đa 10.000 Note.';
    if (side === 'ASK' && freeNotes !== null && quantity > freeNotes) {
      return freeNotes === 0
        ? 'Bạn không còn Note nào của khoản vay này để bán.'
        : `Bạn chỉ còn ${freeNotes} Note bán được.`;
    }
    return null;
  })();

  const ackMissing = defaulted && !acknowledged;
  const valid = !priceError && !quantityError && !ackMissing;

  const stepPrice = (direction: 1 | -1) => {
    const base = Number.isFinite(price) ? price : initialPrice;
    const next = Math.min(PRICE_MAX, Math.max(PRICE_MIN, roundPrice(base + direction * PRICE_STEP)));
    setPriceInput(priceText(next));
  };

  const stepQuantity = (direction: 1 | -1) => {
    const base = Number.isInteger(quantity) ? quantity : 1;
    setQuantityInput(String(Math.min(QUANTITY_MAX, Math.max(1, base + direction))));
  };

  const input = (): PlaceOrderInput => ({
    side,
    price: roundPrice(price),
    quantity,
    acknowledgeDefault: acknowledged,
  });

  return {
    side,
    setSide,
    priceInput,
    setPriceInput,
    setPrice: (value: number) => setPriceInput(priceText(value)),
    stepPrice,
    priceError,
    quantityInput,
    setQuantityInput,
    setQuantity: (value: number) => setQuantityInput(String(value)),
    stepQuantity,
    quantityError,
    acknowledged,
    setAcknowledged,
    price: priceError ? null : roundPrice(price),
    quantity: quantityError ? null : quantity,
    valid,
    input,
  };
}
