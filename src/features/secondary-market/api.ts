import { investmentFetch } from '@/lib/api';
import { isMocked } from '@/lib/mockFlag';
import * as secondaryMock from '@/lib/mocks/secondary';
import type { NoteListing } from '@/types/invest';
import { toNoteListing, type NoteListingDto, type PageDto } from './mapper';

/**
 * Chợ thứ cấp Notes do `finora-investment` phục vụ.
 *
 * Backend đã có thật, nên miền `secondary` mặc định **không** nằm trong `EXPO_PUBLIC_MOCK_DOMAINS`.
 * Thêm tên miền vào biến đó là chuyển sang dữ liệu giả để demo khi chưa chạy được service.
 *
 * Danh tính người bán và người mua lấy từ access token phía backend, nên tầng này không gửi mã
 * nhà đầu tư nào lên.
 */

/** Trang đầu đủ dùng cho danh sách trên điện thoại; không tải không giới hạn. */
const PAGE_SIZE = 20;

/** Bảng tin: các Note đang được treo bán. */
export const listSecondaryListings = async (): Promise<NoteListing[]> => {
  if (isMocked('secondary')) return secondaryMock.listSecondaryListings();

  const page = await investmentFetch<PageDto<NoteListingDto>>(
    `/investments/secondary/listings?page=0&size=${PAGE_SIZE}`,
  );
  return page.content.map(toNoteListing);
};

/** Tin đăng bán của chính người đang đăng nhập. */
export const listMyListings = async (): Promise<NoteListing[]> => {
  if (isMocked('secondary')) return secondaryMock.listMyListings();

  const page = await investmentFetch<PageDto<NoteListingDto>>(
    `/investments/secondary/my-listings?page=0&size=${PAGE_SIZE}`,
  );
  return page.content.map(toNoteListing);
};

/**
 * Treo một Note mình đang giữ lên bảng tin.
 *
 * Giá không được vượt dư nợ gốc còn lại — backend chặn, và màn hình cũng chặn trước để người bán
 * biết ngay thay vì đợi request quay về.
 */
export const listNoteForSale = async (
  noteNumber: string,
  noteId: string,
  askingPrice: number,
): Promise<NoteListing> => {
  if (isMocked('secondary')) return secondaryMock.listNoteForSale(noteNumber, askingPrice);

  const dto = await investmentFetch<NoteListingDto>(
    `/investments/secondary/notes/${noteId}/listings`,
    {
      method: 'POST',
      body: JSON.stringify({ askingPrice: askingPrice.toFixed(2) }),
    },
  );
  return toNoteListing(dto);
};

/**
 * Mua một Note đang treo bán.
 *
 * Không cần `Idempotency-Key`: mã tin đăng bán đã là khóa tự nhiên cho giao dịch này — một tin chỉ
 * bán được một lần — nên backend tự suy mã chống trùng lặp từ đó. Khác luồng đặt lệnh sơ cấp, nơi
 * cùng một người có thể đặt nhiều lệnh vào cùng khoản vay.
 */
export const buyNote = async (reference: string): Promise<NoteListing> => {
  if (isMocked('secondary')) return secondaryMock.buyNote(reference);

  const dto = await investmentFetch<NoteListingDto>(
    `/investments/secondary/listings/${reference}/buy`,
    { method: 'POST' },
  );
  return toNoteListing(dto);
};

/** Rút tin của mình khi chưa ai mua. */
export const cancelListing = async (reference: string): Promise<NoteListing> => {
  if (isMocked('secondary')) return secondaryMock.cancelListing(reference);

  const dto = await investmentFetch<NoteListingDto>(
    `/investments/secondary/listings/${reference}`,
    { method: 'DELETE' },
  );
  return toNoteListing(dto);
};
