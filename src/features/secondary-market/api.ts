import { investmentFetch, investmentStreamRequest } from '@/lib/api';
import { isMocked } from '@/lib/mockFlag';
import * as secondaryMock from '@/lib/mocks/secondary';
import type { BookOrder, BookPosition, BookSnapshot, BookSummary, PlaceOrderInput } from '@/types/orderBook';
import {
  toBookOrder,
  toBookPosition,
  toBookSnapshot,
  toBookSummary,
  toPricePercent,
  type BookOrderDto,
  type BookPositionDto,
  type BookSnapshotDto,
  type BookSummaryDto,
  type PageDto,
} from './mapper';

/**
 * Chợ Notes — sổ lệnh Ask/Bid của `finora-investment` (`/investments/order-books`).
 *
 * Backend đã có thật, nên miền `secondary` mặc định **không** nằm trong `EXPO_PUBLIC_MOCK_DOMAINS`;
 * thêm tên miền vào biến đó là chuyển sang sổ lệnh giả để demo khi chưa chạy được service.
 *
 * Danh tính người đặt lệnh lấy từ access token phía backend, nên tầng này không gửi mã nhà đầu tư.
 */

const BASE = '/investments/order-books';

/** Trang đầu đủ dùng cho danh sách trên điện thoại; không tải không giới hạn. */
const PAGE_SIZE = 20;

/** Các khoản vay còn Note lưu hành, kèm giá mua/bán tốt nhất. */
export const listOrderBooks = async (signal?: AbortSignal): Promise<BookSummary[]> => {
  if (isMocked('secondary')) return secondaryMock.listOrderBooks();
  const page = await investmentFetch<PageDto<BookSummaryDto>>(`${BASE}?page=0&size=${PAGE_SIZE}`, { signal });
  return page.content.map(toBookSummary);
};

export const getOrderBook = async (listingId: number, signal?: AbortSignal): Promise<BookSnapshot> => {
  if (isMocked('secondary')) return secondaryMock.getOrderBook(listingId);
  return toBookSnapshot(await investmentFetch<BookSnapshotDto>(`${BASE}/${listingId}`, { signal }));
};

/** Số Note còn đặt bán được, số đang nằm trong lệnh bán và lệnh còn hiệu lực của tôi. */
export const getMyPosition = async (listingId: number, signal?: AbortSignal): Promise<BookPosition> => {
  if (isMocked('secondary')) return secondaryMock.getMyPosition(listingId);
  return toBookPosition(await investmentFetch<BookPositionDto>(`${BASE}/${listingId}/me`, { signal }));
};

export const listMyOrders = async (activeOnly: boolean, signal?: AbortSignal): Promise<BookOrder[]> => {
  if (isMocked('secondary')) return secondaryMock.listMyOrders(activeOnly);
  const page = await investmentFetch<PageDto<BookOrderDto>>(
    `${BASE}/orders/mine?active=${activeOnly}&page=0&size=${PAGE_SIZE}`,
    { signal },
  );
  return page.content.map(toBookOrder);
};

/**
 * Đặt lệnh giới hạn.
 *
 * `idempotencyKey` do nơi gọi giữ cho tới khi người dùng đổi nội dung lệnh: bấm lại sau lỗi mạng
 * phải gửi cùng khóa để backend trả lệnh cũ chứ không giữ tiền lần hai.
 */
export const placeBookOrder = async (
  listingId: number,
  input: PlaceOrderInput,
  idempotencyKey: string,
): Promise<BookOrder> => {
  if (isMocked('secondary')) return secondaryMock.placeOrder(listingId, input);
  const dto = await investmentFetch<BookOrderDto>(`${BASE}/${listingId}/orders`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      side: input.side,
      pricePercent: toPricePercent(input.price),
      quantity: input.quantity,
      acknowledgeDefault: input.acknowledgeDefault,
    }),
  });
  return toBookOrder(dto);
};

/** Huỷ phần chưa khớp của lệnh; phần đã khớp giữ nguyên. */
export const cancelBookOrder = async (reference: string): Promise<BookOrder> => {
  if (isMocked('secondary')) return secondaryMock.cancelOrder(reference);
  return toBookOrder(await investmentFetch<BookOrderDto>(`${BASE}/orders/${reference}`, { method: 'DELETE' }));
};

/** Bản mock không có luồng đẩy; màn hình hỏi lại định kỳ thay thế. */
export const isStreamAvailable = (): boolean => !isMocked('secondary');

export const orderBookStreamRequest = (listingId: number) =>
  investmentStreamRequest(`${BASE}/${listingId}/stream`);

/** Ảnh chụp đẩy qua luồng có cùng dạng với `GET /{listingId}`. */
export const parseStreamSnapshot = (data: string): BookSnapshot =>
  toBookSnapshot(JSON.parse(data) as BookSnapshotDto);
