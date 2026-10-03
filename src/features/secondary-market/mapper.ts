import type { CreditGrade } from '@/components/ui/ScoreRing';
import type {
  BookOrder,
  BookOrderStatus,
  BookPosition,
  BookSnapshot,
  BookSummary,
  CancelReason,
  OrderSide,
  PriceLevel,
  TradeTick,
} from '@/types/orderBook';

/**
 * Chuyển contract sổ lệnh của Investment Service (`/investments/order-books`) sang model màn hình.
 *
 * Backend trả tiền và giá dạng chuỗi decimal để không mất chính xác khi truyền JSON; đây là ranh
 * giới duy nhất đổi sang number, và chỉ phục vụ hiển thị.
 */

export interface PageDto<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** Đúng như `OrderBookSummaryResponse`. */
export interface BookSummaryDto {
  listingId: number;
  loanId: number;
  creditGrade: string | null;
  annualInterestRate: string;
  termMonths: number;
  noteDenomination: string;
  defaulted: boolean;
  bestBidPercent: string | null;
  bestAskPercent: string | null;
  lastTradePercent: string | null;
  lastTradeAt: string | null;
}

/** Đúng như `OrderBookSnapshotResponse`. */
export interface BookSnapshotDto {
  listingId: number;
  loanId: number;
  sequence: number;
  creditGrade: string | null;
  annualInterestRate: string;
  termMonths: number;
  noteDenomination: string;
  referenceOutstanding: string | null;
  defaulted: boolean;
  defaultWarning: string | null;
  bestBidPercent: string | null;
  bestAskPercent: string | null;
  lastTradePercent: string | null;
  lastTradeAt: string | null;
  bids: { pricePercent: string; quantity: number; orderCount: number }[];
  asks: { pricePercent: string; quantity: number; orderCount: number }[];
  recentTrades: { pricePercent: string; quantity: number; aggressorSide: string; executedAt: string }[];
}

/** Đúng như `BookOrderResponse`. */
export interface BookOrderDto {
  orderReference: string;
  listingId: number;
  loanId: number | null;
  side: string;
  pricePercent: string;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  status: string;
  holdAmount: string | null;
  holdConsumed: string | null;
  holdReleased: boolean;
  cancelReason: string | null;
  rejectReasonCode: string | null;
  rejectReasonDetail: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Đúng như `OrderBookPositionResponse`. */
export interface BookPositionDto {
  listingId: number;
  freeNotes: number;
  lockedNotes: number;
  activeOrders: BookOrderDto[];
}

const GRADES: readonly CreditGrade[] = ['A', 'B', 'C', 'D', 'E'];
const STATUSES: readonly BookOrderStatus[] = [
  'PENDING_FUNDS',
  'OPEN',
  'PARTIALLY_FILLED',
  'FILLED',
  'CANCELLED',
  'REJECTED',
];
const CANCEL_REASONS: readonly CancelReason[] = ['USER', 'SELF_TRADE_PREVENTED', 'NOTE_UNAVAILABLE'];

/** Hạng lạ hoặc thiếu không được làm vỡ giao diện; trả null để màn tự ẩn viên hạng. */
const toGrade = (value: string | null): CreditGrade | null => {
  if (!value) return null;
  const upper = value.trim().toUpperCase();
  return GRADES.find(g => g === upper) ?? null;
};

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toOptional = (value: string | null): number | null => {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Chiều lạ không có trong contract: coi như lệnh bán để không tô nhầm thành tiền đi ra. */
const toSide = (value: string): OrderSide => (value === 'BID' ? 'BID' : 'ASK');

const toStatus = (value: string): BookOrderStatus =>
  STATUSES.find(s => s === value) ?? 'UNKNOWN';

const toCancelReason = (value: string | null): CancelReason | null => {
  if (value == null) return null;
  return CANCEL_REASONS.find(r => r === value) ?? 'UNKNOWN';
};

const toLevel = (dto: { pricePercent: string; quantity: number; orderCount: number }): PriceLevel => ({
  price: toNumber(dto.pricePercent),
  quantity: dto.quantity,
  orderCount: dto.orderCount,
});

const toTick = (dto: BookSnapshotDto['recentTrades'][number]): TradeTick => ({
  price: toNumber(dto.pricePercent),
  quantity: dto.quantity,
  aggressor: toSide(dto.aggressorSide),
  executedAt: dto.executedAt,
});

export function toBookSummary(dto: BookSummaryDto): BookSummary {
  return {
    listingId: dto.listingId,
    loanId: dto.loanId,
    grade: toGrade(dto.creditGrade),
    // Cùng contract liên service với Market: 15.0000 nghĩa là 15%/năm.
    annualRate: Number(toNumber(dto.annualInterestRate).toFixed(2)),
    termMonths: dto.termMonths,
    noteDenomination: toNumber(dto.noteDenomination),
    defaulted: dto.defaulted,
    bestBid: toOptional(dto.bestBidPercent),
    bestAsk: toOptional(dto.bestAskPercent),
    lastTrade: toOptional(dto.lastTradePercent),
    lastTradeAt: dto.lastTradeAt,
  };
}

export function toBookSnapshot(dto: BookSnapshotDto): BookSnapshot {
  return {
    listingId: dto.listingId,
    loanId: dto.loanId,
    sequence: dto.sequence,
    grade: toGrade(dto.creditGrade),
    annualRate: Number(toNumber(dto.annualInterestRate).toFixed(2)),
    termMonths: dto.termMonths,
    noteDenomination: toNumber(dto.noteDenomination),
    referenceOutstanding: toOptional(dto.referenceOutstanding),
    defaulted: dto.defaulted,
    defaultWarning: dto.defaultWarning,
    bestBid: toOptional(dto.bestBidPercent),
    bestAsk: toOptional(dto.bestAskPercent),
    lastTrade: toOptional(dto.lastTradePercent),
    lastTradeAt: dto.lastTradeAt,
    bids: dto.bids.map(toLevel),
    asks: dto.asks.map(toLevel),
    recentTrades: dto.recentTrades.map(toTick),
  };
}

export function toBookOrder(dto: BookOrderDto): BookOrder {
  return {
    reference: dto.orderReference,
    listingId: dto.listingId,
    loanId: dto.loanId,
    side: toSide(dto.side),
    price: toNumber(dto.pricePercent),
    quantity: dto.quantity,
    filled: dto.filledQuantity,
    remaining: dto.remainingQuantity,
    status: toStatus(dto.status),
    holdAmount: toOptional(dto.holdAmount),
    holdConsumed: toOptional(dto.holdConsumed),
    holdReleased: dto.holdReleased,
    cancelReason: toCancelReason(dto.cancelReason),
    rejectReason: dto.rejectReasonDetail,
    createdAt: dto.createdAt,
  };
}

export function toBookPosition(dto: BookPositionDto): BookPosition {
  return {
    listingId: dto.listingId,
    freeNotes: dto.freeNotes,
    lockedNotes: dto.lockedNotes,
    activeOrders: dto.activeOrders.map(toBookOrder),
  };
}

/** Gửi giá lên backend đúng một chữ số thập phân, tránh 97.49999 do số thực. */
export const toPricePercent = (price: number): string => price.toFixed(1);
