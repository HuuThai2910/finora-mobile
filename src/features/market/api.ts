import { isMocked } from '@/lib/mockFlag';
import * as investMock from '@/lib/mocks/invest';
import { apiFetch, generateIdempotencyKey, investmentFetch } from '@/lib/api';
import { PIN_TOKEN_HEADER } from '@/features/pin';
import type { BorrowerProfile, InvestOrderResult, MarketLoan } from '@/types/invest';
import { toBorrowerProfile, type BorrowerProfileDto } from './borrowerMapper';
import {
  toInvestOrderResult,
  toMarketLoan,
  type InvestOrderDto,
  type MarketListingDto,
  type PageDto,
} from './mapper';

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
 * Hồ sơ người vay (ẩn danh, không có SHAP) của một khoản vay trên sàn. Loan là nguồn chuẩn của hồ sơ
 * và kết quả chấm điểm nên app gọi thẳng Loan, như khi tải PDF hợp đồng; Investment không chép số
 * liệu này. Chỉ tài khoản nhà đầu tư gọi được.
 */
export const getBorrowerProfile = async (applicationNumber: string): Promise<BorrowerProfile> => {
  if (isMocked('market')) return investMock.getBorrowerProfile(applicationNumber);

  const profile = await apiFetch<BorrowerProfileDto>(
    `/investor/loan-applications/${encodeURIComponent(applicationNumber)}/borrower-profile`,
  );
  return toBorrowerProfile(profile);
};

/**
 * Đặt lệnh đầu tư — tiền bị phong tỏa trong ví cho tới khi khoản vay gọi đủ vốn.
 *
 * `Idempotency-Key` được sinh một lần cho mỗi ý định đặt lệnh của người dùng, nên bấm hai
 * lần hoặc mạng chập chờn cũng chỉ tạo đúng một lệnh và giữ tiền một lần.
 * `pinToken` (phạm vi `INVEST`) thì luôn lấy mới cho từng lần gửi.
 *
 * Ví không giữ được tiền thì backend vẫn trả 201 kèm `status: REJECTED`, nên trả nguyên kết quả
 * lệnh cho màn hình tự phân biệt, không quy mọi phản hồi về "thành công".
 */
export const invest = async (
  listingId: string,
  amount: number,
  idempotencyKey: string,
  pinToken: string,
): Promise<InvestOrderResult> => {
  if (isMocked('invest')) return investMock.invest(listingId, amount);

  const order = await investmentFetch<InvestOrderDto>(`/investments/listings/${listingId}/orders`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey, [PIN_TOKEN_HEADER]: pinToken },
    body: JSON.stringify({ amount: amount.toFixed(2) }),
  });
  return toInvestOrderResult(order);
};

export { generateIdempotencyKey };
