import { isMocked } from '@/lib/mockFlag';
import * as investMock from '@/lib/mocks/invest';
import { generateIdempotencyKey, investmentFetch } from '@/lib/api';
import type { MarketLoan } from '@/types/invest';
import { toMarketLoan, type MarketListingDto, type PageDto } from './mapper';

/**
 * Sàn khoản vay do `finora-investment` phục vụ.
 *
 * Bỏ tên miền `market` khỏi `EXPO_PUBLIC_MOCK_DOMAINS` là chuyển sang gọi HTTP thật,
 * không phải sửa dòng code nào trong màn hình.
 */

/** Trang đầu đủ dùng cho danh sách trên điện thoại; không tải không giới hạn. */
const PAGE_SIZE = 20;

export const listMarketLoans = async (): Promise<MarketLoan[]> => {
  if (isMocked('market')) return investMock.listMarketLoans();

  const page = await investmentFetch<PageDto<MarketListingDto>>(
    `/market/listings?page=0&size=${PAGE_SIZE}`,
  );
  return page.content.map(toMarketLoan);
};

export const getMarketLoan = async (listingId: string): Promise<MarketLoan> => {
  if (isMocked('market')) return investMock.getMarketLoan(listingId);

  const listing = await investmentFetch<MarketListingDto>(`/market/listings/${listingId}`);
  return toMarketLoan(listing);
};

/**
 * Đặt lệnh đầu tư — tiền bị phong tỏa trong ví cho tới khi khoản vay gọi đủ vốn.
 *
 * `Idempotency-Key` được sinh một lần cho mỗi ý định đặt lệnh của người dùng, nên bấm hai
 * lần hoặc mạng chập chờn cũng chỉ tạo đúng một lệnh và giữ tiền một lần.
 */
export const invest = async (
  listingId: string,
  amount: number,
  idempotencyKey: string,
): Promise<{ ok: true }> => {
  if (isMocked('invest')) return investMock.invest();

  await investmentFetch(`/investments/listings/${listingId}/orders`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ amount: amount.toFixed(2) }),
  });
  return { ok: true };
};

export { generateIdempotencyKey };
