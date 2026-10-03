import type { CreditGrade } from '@/components/ui/ScoreRing';
import type {
  BookOrder,
  BookPosition,
  BookSnapshot,
  BookSummary,
  OrderSide,
  PlaceOrderInput,
  PriceLevel,
  TradeTick,
} from '@/types/orderBook';
import { ApiError } from '@/lib/api';
import { mockResponse } from './delay';

/**
 * Sổ lệnh giả cho chợ Notes, dùng khi chưa chạy được `finora-investment`.
 *
 * Backend đã có thật nên đây chỉ là đường dự phòng để demo giao diện. Vẫn khớp theo đúng luật của
 * backend (giá tốt hơn trước, cùng giá thì vào trước; giá khớp là giá lệnh nằm chờ; chặn tự khớp)
 * để màn hình không quen với một hành vi khác bản thật.
 */

const ME = 'me';

type MockBook = {
  listingId: number;
  loanId: number;
  grade: CreditGrade;
  annualRate: number;
  termMonths: number;
  denomination: number;
  /** Dư nợ hiện tại của mỗi Note trong đợt. */
  outstanding: number;
  defaulted: boolean;
  /** Note của tôi trong đợt, kể cả Note đang nằm trong lệnh bán. */
  myNotes: number;
  sequence: number;
  trades: TradeTick[];
};

type MockOrder = BookOrder & { investor: string; sequence: number };

const BOOKS: MockBook[] = [
  { listingId: 31, loanId: 3041, grade: 'A', annualRate: 13.5, termMonths: 12, denomination: 1_000_000, outstanding: 1_000_000, defaulted: false, myNotes: 6, sequence: 0, trades: [] },
  { listingId: 24, loanId: 2044, grade: 'B', annualRate: 15, termMonths: 9, denomination: 1_000_000, outstanding: 820_000, defaulted: false, myNotes: 0, sequence: 0, trades: [] },
  { listingId: 18, loanId: 1877, grade: 'D', annualRate: 18, termMonths: 6, denomination: 500_000, outstanding: 410_000, defaulted: true, myNotes: 2, sequence: 0, trades: [] },
];

const ORDERS: MockOrder[] = [];
let referenceSeq = 100;

function seed(listingId: number, investor: string, side: OrderSide, price: number, quantity: number) {
  const book = requireBook(listingId);
  book.sequence += 1;
  ORDERS.push(newOrder(listingId, investor, side, price, quantity, book.sequence));
}

function newOrder(
  listingId: number,
  investor: string,
  side: OrderSide,
  price: number,
  quantity: number,
  sequence: number,
): MockOrder {
  referenceSeq += 1;
  return {
    reference: `OB-MOCK-${referenceSeq}`,
    listingId,
    loanId: requireBook(listingId).loanId,
    side,
    price,
    quantity,
    filled: 0,
    remaining: quantity,
    status: 'OPEN',
    holdAmount: null,
    holdConsumed: null,
    holdReleased: false,
    cancelReason: null,
    rejectReason: null,
    createdAt: new Date().toISOString(),
    investor,
    sequence,
  };
}

seed(31, 'a', 'ASK', 98, 4);
seed(31, 'b', 'ASK', 97.5, 2);
seed(31, 'c', 'BID', 96, 3);
seed(31, 'd', 'BID', 95.5, 5);
seed(31, 'e', 'BID', 94, 1);
seed(24, 'f', 'ASK', 99, 3);
seed(24, 'g', 'BID', 97.2, 2);
seed(18, 'h', 'ASK', 62, 4);
seed(18, 'i', 'BID', 55, 6);
requireBook(31).trades.push({ price: 97, quantity: 2, aggressor: 'BID', executedAt: new Date(Date.now() - 18 * 60_000).toISOString() });

function requireBook(listingId: number): MockBook {
  const book = BOOKS.find(b => b.listingId === listingId);
  if (!book) throw new ApiError(404, 'mock', 'LISTING_NOT_FOUND', 'Không tìm thấy khoản vay');
  return book;
}

const resting = (o: MockOrder) => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED';
const restingOf = (listingId: number, side: OrderSide) =>
  ORDERS.filter(o => o.listingId === listingId && o.side === side && resting(o));

function levels(listingId: number, side: OrderSide): PriceLevel[] {
  const map = new Map<number, PriceLevel>();
  for (const o of restingOf(listingId, side)) {
    const level = map.get(o.price) ?? { price: o.price, quantity: 0, orderCount: 0 };
    level.quantity += o.remaining;
    level.orderCount += 1;
    map.set(o.price, level);
  }
  return [...map.values()].sort((a, b) => (side === 'BID' ? b.price - a.price : a.price - b.price));
}

function snapshotOf(book: MockBook): BookSnapshot {
  const bids = levels(book.listingId, 'BID');
  const asks = levels(book.listingId, 'ASK');
  const last = book.trades[0];
  return {
    listingId: book.listingId,
    loanId: book.loanId,
    sequence: book.sequence,
    grade: book.grade,
    annualRate: book.annualRate,
    termMonths: book.termMonths,
    noteDenomination: book.denomination,
    referenceOutstanding: book.outstanding,
    defaulted: book.defaulted,
    defaultWarning: book.defaulted
      ? 'Khoản vay gốc đang trong tình trạng nợ xấu; Note có thể không thu hồi đủ gốc lãi'
      : null,
    bestBid: bids[0]?.price ?? null,
    bestAsk: asks[0]?.price ?? null,
    lastTrade: last?.price ?? null,
    lastTradeAt: last?.executedAt ?? null,
    bids,
    asks,
    recentTrades: book.trades.slice(0, 20),
  };
}

const toPublic = ({ investor: _investor, sequence: _sequence, ...order }: MockOrder): BookOrder => ({ ...order });

function fill(order: MockOrder, quantity: number) {
  order.filled += quantity;
  order.remaining -= quantity;
  order.status = order.remaining === 0 ? 'FILLED' : 'PARTIALLY_FILLED';
}

function match(book: MockBook, incoming: MockOrder) {
  const opposite = restingOf(book.listingId, incoming.side === 'BID' ? 'ASK' : 'BID')
    .filter(o => (incoming.side === 'BID' ? o.price <= incoming.price : o.price >= incoming.price))
    .sort((a, b) =>
      a.price === b.price ? a.sequence - b.sequence : incoming.side === 'BID' ? a.price - b.price : b.price - a.price,
    );

  for (const other of opposite) {
    if (incoming.remaining === 0) break;
    if (other.investor === incoming.investor) {
      incoming.status = 'CANCELLED';
      incoming.cancelReason = 'SELF_TRADE_PREVENTED';
      return;
    }
    const quantity = Math.min(incoming.remaining, other.remaining);
    fill(incoming, quantity);
    fill(other, quantity);
    const amount = Math.round((book.outstanding * other.price) / 100) * quantity;
    const bid = incoming.side === 'BID' ? incoming : other;
    if (bid.holdConsumed != null) bid.holdConsumed += amount;
    if (incoming.investor === ME) book.myNotes += incoming.side === 'BID' ? quantity : -quantity;
    else if (other.investor === ME) book.myNotes += other.side === 'BID' ? quantity : -quantity;
    book.trades.unshift({ price: other.price, quantity, aggressor: incoming.side, executedAt: new Date().toISOString() });
  }
}

function lockedNotes(listingId: number) {
  return restingOf(listingId, 'ASK')
    .filter(o => o.investor === ME)
    .reduce((sum, o) => sum + o.remaining, 0);
}

export const listOrderBooks = (): Promise<BookSummary[]> =>
  mockResponse(
    'secondary',
    BOOKS.map(book => {
      const s = snapshotOf(book);
      return {
        listingId: s.listingId,
        loanId: s.loanId,
        grade: s.grade,
        annualRate: s.annualRate,
        termMonths: s.termMonths,
        noteDenomination: s.noteDenomination,
        defaulted: s.defaulted,
        bestBid: s.bestBid,
        bestAsk: s.bestAsk,
        lastTrade: s.lastTrade,
        lastTradeAt: s.lastTradeAt,
      };
    }),
  );

export const getOrderBook = (listingId: number): Promise<BookSnapshot> =>
  mockResponse('secondary', snapshotOf(requireBook(listingId)));

export const getMyPosition = (listingId: number): Promise<BookPosition> => {
  const book = requireBook(listingId);
  const locked = lockedNotes(listingId);
  return mockResponse('secondary', {
    listingId,
    freeNotes: Math.max(book.myNotes - locked, 0),
    lockedNotes: locked,
    activeOrders: ORDERS.filter(o => o.listingId === listingId && o.investor === ME && resting(o)).map(toPublic),
  });
};

export const listMyOrders = (activeOnly: boolean): Promise<BookOrder[]> =>
  mockResponse(
    'secondary',
    ORDERS.filter(o => o.investor === ME && (!activeOnly || resting(o)))
      .sort((a, b) => b.sequence - a.sequence)
      .map(toPublic),
  );

export const placeOrder = (listingId: number, input: PlaceOrderInput): Promise<BookOrder> => {
  const book = requireBook(listingId);
  if (book.defaulted && !input.acknowledgeDefault) {
    return Promise.reject(new ApiError(400, 'mock', 'DEFAULT_NOT_ACKNOWLEDGED',
      'Khoản vay này đang nợ xấu; hãy xác nhận đã đọc cảnh báo trước khi đặt lệnh'));
  }
  if (input.side === 'ASK' && book.myNotes - lockedNotes(listingId) < input.quantity) {
    return Promise.reject(new ApiError(409, 'mock', 'INSUFFICIENT_FREE_NOTES',
      `Bạn chỉ còn ${Math.max(book.myNotes - lockedNotes(listingId), 0)} Note của khoản vay này chưa nằm trong lệnh bán nào`));
  }
  book.sequence += 1;
  const order = newOrder(listingId, ME, input.side, input.price, input.quantity, book.sequence);
  if (input.side === 'BID') {
    order.holdAmount = Math.round((book.outstanding * input.price) / 100) * input.quantity;
    order.holdConsumed = 0;
  }
  ORDERS.push(order);
  match(book, order);
  return mockResponse('secondary', toPublic(order));
};

export const cancelOrder = (reference: string): Promise<BookOrder> => {
  const order = ORDERS.find(o => o.reference === reference && o.investor === ME);
  if (!order) return Promise.reject(new ApiError(404, 'mock', 'ORDER_NOT_FOUND', 'Không tìm thấy lệnh này'));
  if (order.status === 'FILLED') {
    return Promise.reject(new ApiError(409, 'mock', 'ORDER_ALREADY_FILLED', 'Lệnh đã khớp hết nên không còn gì để huỷ'));
  }
  if (resting(order)) {
    order.status = 'CANCELLED';
    order.cancelReason = 'USER';
    requireBook(order.listingId).sequence += 1;
  }
  return mockResponse('secondary', toPublic(order));
};
