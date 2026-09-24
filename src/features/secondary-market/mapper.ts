import type { CreditGrade } from '@/components/ui/ScoreRing';
import type { NoteListing, NoteListingStatus } from '@/types/invest';

/**
 * Chuyển contract chợ thứ cấp của Investment Service sang model màn hình dùng.
 *
 * Backend trả tiền và lãi suất dạng chuỗi decimal để không mất chính xác khi truyền JSON; đây là
 * ranh giới duy nhất đổi sang number, và chỉ phục vụ hiển thị.
 */

/** Đúng như `NoteListingResponse` của backend. */
export interface NoteListingDto {
  listingReference: string;
  noteNumber: string;
  loanId: number;
  sellerId: string;
  askingPrice: string;
  outstandingPrincipal: string;
  defaultedReason: string | null;
  defaulted: boolean;
  annualInterestRate: string;
  termMonths: number;
  creditGrade: string | null;
  estimatedFee: string;
  estimatedProceeds: string;
  status: string;
  buyerId: string | null;
  soldPrice: string | null;
  platformFee: string | null;
  sellerProceeds: string | null;
  soldAt: string | null;
  createdAt: string;
}

export interface PageDto<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const VALID_GRADES: readonly CreditGrade[] = ['A', 'B', 'C', 'D', 'E'];

/** Hạng lạ hoặc thiếu không được làm vỡ giao diện; trả null để màn hình tự ẩn ô hạng. */
const toGrade = (value: string | null): CreditGrade | null => {
  if (!value) return null;
  const upper = value.trim().toUpperCase();
  return VALID_GRADES.find(grade => grade === upper) ?? null;
};

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toOptionalNumber = (value: string | null): number | null => {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const VALID_STATUS: readonly NoteListingStatus[] = ['OPEN', 'SOLD', 'CANCELLED'];

/** Trạng thái lạ từ backend rơi về 'OPEN' thay vì làm vỡ màn hình. */
const toStatus = (value: string): NoteListingStatus =>
  VALID_STATUS.find(status => status === value) ?? 'OPEN';

export function toNoteListing(dto: NoteListingDto): NoteListing {
  return {
    reference: dto.listingReference,
    noteNumber: dto.noteNumber,
    loanId: String(dto.loanId),
    sellerId: dto.sellerId,
    askingPrice: toNumber(dto.askingPrice),
    outstandingPrincipal: toNumber(dto.outstandingPrincipal),
    defaulted: dto.defaulted,
    defaultedReason: dto.defaultedReason,
    // Backend lưu lãi suất dạng tỷ lệ (0.1500); giao diện hiển thị theo phần trăm.
    annualRate: Number((toNumber(dto.annualInterestRate) * 100).toFixed(2)),
    termMonths: dto.termMonths,
    grade: toGrade(dto.creditGrade),
    estimatedFee: toNumber(dto.estimatedFee),
    estimatedProceeds: toNumber(dto.estimatedProceeds),
    status: toStatus(dto.status),
    buyerId: dto.buyerId,
    soldPrice: toOptionalNumber(dto.soldPrice),
    platformFee: toOptionalNumber(dto.platformFee),
    sellerProceeds: toOptionalNumber(dto.sellerProceeds),
  };
}
