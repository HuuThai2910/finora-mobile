import type { NoteListing } from '@/types/invest';
import { mockResponse } from './delay';
import { SECONDARY_LISTINGS, SECONDARY_MY_LISTINGS } from './fixtures';

/**
 * Dữ liệu giả cho chợ thứ cấp, dùng khi chưa chạy được `finora-investment`.
 *
 * Backend của miền này đã có thật, nên đây chỉ là đường dự phòng để demo giao diện — khác các miền
 * còn thiếu backend, nơi mock là đường duy nhất.
 */

export const listSecondaryListings = (): Promise<NoteListing[]> =>
  mockResponse('secondary', SECONDARY_LISTINGS);

export const listMyListings = (): Promise<NoteListing[]> =>
  mockResponse('secondary', SECONDARY_MY_LISTINGS);

export const listNoteForSale = (noteNumber: string, askingPrice: number): Promise<NoteListing> => {
  const fee = Math.floor(askingPrice * 0.05);
  return mockResponse('secondary', {
    reference: `NL-MOCK-${noteNumber}`,
    noteNumber,
    loanId: '2044',
    sellerId: 'me',
    askingPrice,
    outstandingPrincipal: askingPrice,
    defaulted: false,
    defaultedReason: null,
    annualRate: 15,
    termMonths: 9,
    grade: 'A',
    estimatedFee: fee,
    estimatedProceeds: askingPrice - fee,
    status: 'OPEN',
    buyerId: null,
    soldPrice: null,
    platformFee: null,
    sellerProceeds: null,
  });
};

export const buyNote = (reference: string): Promise<NoteListing> => {
  const found = SECONDARY_LISTINGS.find(item => item.reference === reference)
    ?? SECONDARY_LISTINGS[0];
  const fee = Math.floor(found.askingPrice * 0.05);
  return mockResponse('secondary', {
    ...found,
    status: 'SOLD',
    buyerId: 'me',
    soldPrice: found.askingPrice,
    platformFee: fee,
    sellerProceeds: found.askingPrice - fee,
  });
};

export const cancelListing = (reference: string): Promise<NoteListing> => {
  const found = SECONDARY_MY_LISTINGS.find(item => item.reference === reference)
    ?? SECONDARY_MY_LISTINGS[0];
  return mockResponse('secondary', { ...found, status: 'CANCELLED' });
};
