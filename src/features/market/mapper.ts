import type { CreditGrade } from '@/components/ui/ScoreRing';
import type {
  InvestOrderResult,
  InvestOrderStatus,
  MarketListingStatus,
  MarketLoan,
} from '@/types/invest';
import { formatDong } from '@/utils/format';
import { normalizeForMatch } from '@/utils/search';

/**
 * Chuyển contract của Investment Service sang model mà màn hình đang dùng.
 *
 * Backend trả tiền và lãi suất dạng chuỗi decimal để không mất chính xác khi truyền JSON;
 * đây là ranh giới duy nhất được đổi sang number, và chỉ phục vụ hiển thị.
 */

/** Bản chiếu khoản vay trên sàn, đúng như `MarketListingResponse` của backend. */
export interface MarketListingDto {
  listingId: number;
  loanId: number;
  purpose: string;
  region: string;
  creditGrade: string;
  creditScore: number;
  targetAmount: string;
  committedAmount: string;
  remainingAmount: string;
  fundedPercent: number;
  annualInterestRate: string;
  termMonths: number;
  repaymentMethod: string;
  noteDenomination: string;
  minInvestmentAmount: string;
  status: string;
  contractNumber: string | null;
  contractStatus: string | null;
  fundingClosesAt: string | null;
  /** Mã hồ sơ vay của Loan; bản backend cũ chưa trả field này. */
  applicationNumber?: string | null;
  /** Mã hiển thị `HS-…`/`HĐ-…`; listing tạo trước khi Loan có mã để null. */
  applicationCode?: string | null;
  contractCode?: string | null;
  /** Mã `LoanPurpose` của Loan (`EDUCATION`…); listing cũ hoặc bản backend cũ không có. */
  purposeCode?: string | null;
  /** Lý do Loan hủy đợt gọi vốn đã đủ vốn; bản backend cũ chưa trả field này. */
  cancellationReason?: string | null;
  /** Họ tên người vay; chỉ API chi tiết trả, danh sách và bản backend cũ không có. */
  borrowerFullName?: string | null;
}

export interface PageDto<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** `OrderResponse` của `POST /investments/listings/{id}/orders`. */
export interface InvestOrderDto {
  orderReference: string;
  listingId: number;
  amount: string;
  status: string;
  paymentHoldReference: string | null;
  rejectedReasonCode: string | null;
  rejectedReasonDetail: string | null;
  createdAt: string;
}

const VALID_GRADES: readonly CreditGrade[] = ['A', 'B', 'C', 'D', 'E'];
const LISTING_STATUSES: readonly MarketListingStatus[] = ['OPEN', 'FULLY_FUNDED', 'CLOSED', 'CANCELLED'];
const ORDER_STATUSES: readonly InvestOrderStatus[] = ['PENDING_FUNDS', 'COMMITTED', 'REJECTED', 'CANCELLED'];

/** Hạng lạ từ backend không được làm vỡ giao diện; rơi về 'C' để vẫn hiển thị được. */
const toGrade = (value: string): CreditGrade => {
  const upper = value.trim().toUpperCase();
  return VALID_GRADES.find(grade => grade === upper) ?? 'C';
};

/** Trạng thái backend thêm mới (DRAFT hay loại sau này) không được coi là đang mở nhận vốn. */
const toEnum = <T extends string>(allowed: readonly T[], value: string | null | undefined): T | 'UNKNOWN' =>
  allowed.find(item => item === value) ?? 'UNKNOWN';

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function toMarketLoan(dto: MarketListingDto): MarketLoan {
  return {
    id: String(dto.listingId),
    amount: toNumber(dto.targetAmount),
    committedAmount: toNumber(dto.committedAmount),
    remainingAmount: toNumber(dto.remainingAmount),
    // Contract liên service dùng điểm phần trăm: 15.0000 nghĩa là 15%/năm. Giữ đủ chữ số lẻ
    // để số tạm tính đúng mức đã công bố; chỗ hiển thị tự làm tròn.
    annualRate: toNumber(dto.annualInterestRate),
    termMonths: dto.termMonths,
    repaymentMethod: dto.repaymentMethod,
    purpose: dto.purpose,
    purposeCode: dto.purposeCode ?? null,
    region: dto.region,
    grade: toGrade(dto.creditGrade),
    score: dto.creditScore,
    fundedPercent: Math.round(dto.fundedPercent),
    noteDenomination: toNumber(dto.noteDenomination),
    minInvestmentAmount: toNumber(dto.minInvestmentAmount),
    status: toEnum(LISTING_STATUSES, dto.status),
    fundingClosesAt: dto.fundingClosesAt,
    contractNumber: dto.contractNumber,
    contractStatus: dto.contractStatus,
    applicationNumber: dto.applicationNumber ?? null,
    applicationCode: dto.applicationCode ?? null,
    contractCode: dto.contractCode ?? null,
    cancellationReason: dto.cancellationReason ?? null,
    borrowerName: dto.borrowerFullName?.trim() || null,
  };
}

/**
 * Câu báo lỗi của Investment ghi số tiền thô ("Khoản vay chỉ còn nhận thêm 6000000.00 đồng");
 * đổi tại chỗ thành "6.000.000 đ" như mọi số tiền khác trên app, phần chữ giữ nguyên. Khoảng
 * trắng trước "đ" không ngắt để chữ "đ" không rơi một mình xuống dòng.
 */
/**
 * Lọc khoản vay trên Sàn theo từ khoá người dùng gõ: mục đích vay (kèm chi tiết người vay tự nhập), khu vực và mã
 * hồ sơ `HS-…`. Bỏ dấu cả hai phía nên gõ "giáo dục" hay "giao duc" đều khớp; từ khoá trống thì giữ nguyên.
 */
export function filterMarketLoans(loans: readonly MarketLoan[], query: string): MarketLoan[] {
  const needle = normalizeForMatch(query);
  if (!needle) return [...loans];
  return loans.filter(loan =>
    [loan.purpose, loan.region, loan.applicationCode ?? '']
      .some(text => normalizeForMatch(text).includes(needle)),
  );
}

export const readableAmounts = (message: string): string =>
  message.replace(/(\d+)(?:\.(\d+))?\s*đồng/g, (_match, whole: string, fraction?: string) =>
    formatDong(Number(fraction && Number(fraction) > 0 ? `${whole}.${fraction}` : whole)).replace(' ', ' '),
  );

export function toInvestOrderResult(dto: InvestOrderDto): InvestOrderResult {
  return {
    orderReference: dto.orderReference,
    amount: toNumber(dto.amount),
    status: toEnum(ORDER_STATUSES, dto.status),
    rejectedReasonCode: dto.rejectedReasonCode,
    rejectedReasonDetail: dto.rejectedReasonDetail ? readableAmounts(dto.rejectedReasonDetail) : null,
  };
}
