/** Mọi số tiền là số nguyên đồng — không dùng số thực cho tiền. */
export interface WalletBalance {
  available: number;
  held: number;
}

export type WalletTxDirection = 'in' | 'out';

export interface WalletTransaction {
  id: string;
  /**
   * Thời điểm phát sinh theo ISO 8601 có múi giờ, ví dụ "2026-07-10T21:14:00+07:00".
   * Trước đây là chuỗi "10/07 21:14" đã format sẵn nên thiếu năm, không nhóm được
   * theo tháng; màn hình tự format bằng `formatRecentTime` như trang chủ.
   */
  occurredAt: string;
  description: string;
  amount: number;
  direction: WalletTxDirection;
}

export interface TopUpInstruction {
  /** Chuỗi mã hoá trong ảnh QR. */
  qrPayload: string;
  virtualAccount: string;
  bankName: string;
  transferNote: string;
}

export type TopUpStatus =
  | 'PROVIDER_PENDING'
  | 'AWAITING_PAYMENT'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'RECONCILIATION_REQUIRED';

export interface TopUpOrder {
  topUpId: string;
  amount: number;
  currency: string;
  provider: 'MOCK' | 'ZALOPAY' | string;
  providerOrderId: string;
  providerReference: string | null;
  checkoutUrl: string | null;
  qrPayload: string | null;
  status: TopUpStatus;
  errorCode: string | null;
  errorDetail: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  mockCompletionAvailable: boolean;
}

/* ---------- Rút tiền về tài khoản ngân hàng (R4, W3B) — khớp DTO của Payment Service ---------- */

/** Ngân hàng nhận được hỗ trợ; `code` là mã gửi lại trong lệnh rút. */
export interface WithdrawalBank {
  code: string;
  name: string;
}

/**
 * `GET /wallets/withdrawal-policy`: policy demo cấu hình được (Q4/D19) của người đang đăng nhập.
 * `usedToday`/`remainingToday` tính theo ngày nghiệp vụ Việt Nam và không tính lệnh đã thất bại (đã hoàn tiền).
 */
export interface WithdrawalPolicy {
  minimumAmount: number;
  dailyLimit: number;
  feeAmount: number;
  /** Ngày nghiệp vụ `yyyy-MM-dd` đang dùng để cộng hạn mức. */
  businessDate: string;
  usedToday: number;
  remainingToday: number;
  availableBalance: number;
  /** `true`: lệnh chi do provider giả lập xử lý, không có tiền thật rời hệ thống. */
  simulatedProvider: boolean;
  banks: WithdrawalBank[];
}

/**
 * Vòng đời lệnh rút. Tiền đã rời ví từ `REQUESTED`; `FAILED` luôn đi kèm bút toán hoàn tiền về ví.
 * `RECONCILIATION_REQUIRED`: chưa rõ provider đã chi hay chưa, Payment chỉ tra cứu lại chứ không gửi lệnh chi mới.
 */
export type WithdrawalStatus =
  | 'REQUESTED'
  | 'PROCESSING'
  | 'PROVIDER_PENDING'
  | 'RECONCILIATION_REQUIRED'
  | 'COMPLETED'
  | 'FAILED';

/** `WithdrawalResponse`: số tài khoản chỉ ở dạng che; `failureCode/failureReason` chỉ có khi `FAILED`. */
export interface Withdrawal {
  withdrawalId: string;
  amount: number;
  feeAmount: number;
  currency: string;
  status: WithdrawalStatus;
  bankCode: string;
  bankName: string;
  /** Dạng che của backend, ví dụ "******1234". */
  accountNumberMasked: string;
  /** Backend đã chuẩn hoá: viết hoa, gộp khoảng trắng. */
  accountHolderName: string;
  failureCode: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

/** Thân `POST /wallets/me/withdrawals`; số tài khoản đầy đủ chỉ đi trong request này, không bao giờ trả lại. */
export interface CreateWithdrawalRequest {
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
}

/** `PageResponse` chung của finora-common: danh sách nằm ở `content`, trang tính từ 0. */
export interface WithdrawalPage {
  content: Withdrawal[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DueInstallment {
  loanId: string;
  period: number;
  dueDate: string;
  daysLeft: number;
  principal: number;
  interest: number;
  total: number;
  investorCount: number;
}
