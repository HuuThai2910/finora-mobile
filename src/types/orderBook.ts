import type { CreditGrade } from '@/components/ui/ScoreRing';

/**
 * Model màn hình của chợ Notes — sổ lệnh Ask/Bid (INV-E2). Giá luôn là % dư nợ gốc còn lại của
 * Note, một chữ số thập phân; tiền là số VND chỉ để hiển thị.
 */

export type OrderSide = 'BID' | 'ASK';

export type BookOrderStatus =
  | 'PENDING_FUNDS'
  | 'OPEN'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'CANCELLED'
  | 'REJECTED'
  /** Trạng thái backend thêm sau này: hiện nhãn trung tính thay vì làm vỡ màn. */
  | 'UNKNOWN';

export type CancelReason = 'USER' | 'SELF_TRADE_PREVENTED' | 'NOTE_UNAVAILABLE' | 'UNKNOWN';

/** Một dòng trong danh sách sổ lệnh. */
export interface BookSummary {
  listingId: number;
  loanId: number;
  grade: CreditGrade | null;
  annualRate: number;
  termMonths: number;
  noteDenomination: number;
  defaulted: boolean;
  bestBid: number | null;
  bestAsk: number | null;
  lastTrade: number | null;
  lastTradeAt: string | null;
}

/** Một mức giá: tổng số Note còn chờ khớp và số lệnh góp vào. */
export interface PriceLevel {
  price: number;
  quantity: number;
  orderCount: number;
}

export interface TradeTick {
  price: number;
  quantity: number;
  /** Bên vừa đặt lệnh và chạm vào lệnh đang nằm chờ. */
  aggressor: OrderSide;
  executedAt: string;
}

/** Ảnh chụp công khai của một sổ — không có ai đặt lệnh nào. */
export interface BookSnapshot {
  listingId: number;
  loanId: number;
  /** Tăng mỗi lần sổ đổi; ảnh đến muộn có số nhỏ hơn thì bỏ. */
  sequence: number;
  grade: CreditGrade | null;
  annualRate: number;
  termMonths: number;
  noteDenomination: number;
  /** Dư nợ lớn nhất của một Note còn lưu hành — cơ sở để hiện số tạm tính. */
  referenceOutstanding: number | null;
  defaulted: boolean;
  defaultWarning: string | null;
  bestBid: number | null;
  bestAsk: number | null;
  lastTrade: number | null;
  lastTradeAt: string | null;
  bids: PriceLevel[];
  asks: PriceLevel[];
  recentTrades: TradeTick[];
}

/** Lệnh của chính người đang đăng nhập. */
export interface BookOrder {
  reference: string;
  listingId: number;
  /** Khoản vay gốc của sổ; null nếu backend không tìm thấy (khoản đã bị gỡ). */
  loanId: number | null;
  side: OrderSide;
  price: number;
  quantity: number;
  filled: number;
  remaining: number;
  status: BookOrderStatus;
  /** Chỉ lệnh mua có: tiền đã giữ và phần đã dùng cho các lần khớp. */
  holdAmount: number | null;
  holdConsumed: number | null;
  holdReleased: boolean;
  cancelReason: CancelReason | null;
  rejectReason: string | null;
  createdAt: string;
}

export interface BookPosition {
  listingId: number;
  /** Note còn đặt bán được — chưa nằm trong lệnh bán nào. */
  freeNotes: number;
  /** Note đang nằm trong lệnh bán, vẫn thuộc bạn cho tới khi khớp. */
  lockedNotes: number;
  activeOrders: BookOrder[];
}

export interface PlaceOrderInput {
  side: OrderSide;
  /** % dư nợ, bước 0,1. */
  price: number;
  quantity: number;
  acknowledgeDefault: boolean;
}
