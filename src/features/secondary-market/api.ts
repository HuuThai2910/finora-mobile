import { investmentFetch } from '@/lib/api';
import { WS_BASE_URL } from '@/lib/apiBaseUrl';
import { PIN_TOKEN_HEADER } from '@/features/pin';
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
 * `pinToken` (phạm vi `ORDER`) thì luôn lấy mới cho từng lần gửi. Huỷ lệnh không cần PIN.
 */
export const placeBookOrder = async (
  listingId: number,
  input: PlaceOrderInput,
  idempotencyKey: string,
  pinToken: string,
): Promise<BookOrder> => {
  if (isMocked('secondary')) return secondaryMock.placeOrder(listingId, input);
  const dto = await investmentFetch<BookOrderDto>(`${BASE}/${listingId}/orders`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey, [PIN_TOKEN_HEADER]: pinToken },
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

/** Bản mock không có kênh đẩy; màn hình hỏi lại định kỳ thay thế. */
export const isStreamAvailable = (): boolean => !isMocked('secondary');

/** Vé mở WebSocket của một sổ: dùng một lần, hết hạn sau khoảng 30 giây, chỉ cho đúng sổ đã xin. */
type StreamTicketDto = { ticket: string; path: string; expiresAt: string };

/** Tin server gửi trên kênh; hiện chỉ có `snapshot` (cả ảnh sổ, cùng dạng `GET /{listingId}`). */
type StreamMessageDto = { type: string; data?: BookSnapshotDto };

/**
 * Địa chỉ WebSocket đã gắn vé. WebSocket không gắn được header `Authorization` nên xác thực bằng vé: xin vé qua REST
 * (bearer token như mọi API) rồi đưa vào query lúc bắt tay. Mỗi lần nối lại phải xin vé mới.
 */
export const orderBookSocketUrl = async (listingId: number): Promise<string> => {
  const ticket = await investmentFetch<StreamTicketDto>(`${BASE}/${listingId}/stream-ticket`, { method: 'POST' });
  return `${WS_BASE_URL}${ticket.path}?ticket=${encodeURIComponent(ticket.ticket)}`;
};

/** Ảnh sổ trong một tin của kênh; tin loại khác trả `null`. */
export const parseStreamMessage = (data: string): BookSnapshot | null => {
  const message = JSON.parse(data) as StreamMessageDto;
  return message.type === 'snapshot' && message.data ? toBookSnapshot(message.data) : null;
};
