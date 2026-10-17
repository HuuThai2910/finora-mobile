import { isMocked } from '@/lib/mockFlag';
import * as walletMock from '@/lib/mocks/wallet';
import { ApiError, generateIdempotencyKey, paymentFetch } from '@/lib/api';
import { PIN_TOKEN_HEADER } from '@/features/pin';
import type {
  CreateWithdrawalRequest,
  DueInstallment,
  TopUpInstruction,
  TopUpOrder,
  WalletBalance,
  WalletTransaction,
  Withdrawal,
  WithdrawalPage,
  WithdrawalPolicy,
} from '@/types/wallet';

/**
 * Ví, nạp tiền và rút tiền dùng Payment Service. Các API trả nợ cũ chưa thuộc đợt này
 * vẫn giữ mock độc lập, không làm giả số dư đã được hạch toán ở backend.
 */
const notImplemented = (what: string): never => {
  throw new ApiError(501, `${what} chưa có endpoint thật`, 'NOT_IMPLEMENTED');
};

export const getBalance = (): Promise<WalletBalance> =>
  isMocked('wallet') ? walletMock.getBalance() : paymentFetch<WalletBalance>('/wallets/me');

export const getTransactions = (): Promise<WalletTransaction[]> =>
  isMocked('wallet')
    ? walletMock.getTransactions()
    : paymentFetch<WalletTransaction[]>('/wallets/me/transactions').then(items =>
        items.map(item => ({
          ...item,
          direction: (item.direction as unknown as string) === 'CREDIT' ? 'in' : 'out',
        })),
      );

export const createTopUp = (amount: number): Promise<TopUpOrder> =>
  isMocked('wallet')
    ? walletMock.createTopUp(amount)
    : paymentFetch<TopUpOrder>('/wallets/me/top-ups', {
        method: 'POST',
        headers: { 'Idempotency-Key': generateIdempotencyKey() },
        body: JSON.stringify({ amount }),
        timeoutMs: 15_000,
      });

export const getTopUp = (topUpId: string): Promise<TopUpOrder> =>
  isMocked('wallet')
    ? walletMock.getTopUp(topUpId)
    : paymentFetch<TopUpOrder>(`/wallets/me/top-ups/${encodeURIComponent(topUpId)}`);

export const completeMockTopUp = (topUpId: string): Promise<TopUpOrder> =>
  isMocked('wallet')
    ? walletMock.completeTopUp(topUpId)
    : paymentFetch<TopUpOrder>(
        `/wallets/me/top-ups/${encodeURIComponent(topUpId)}/mock-complete`,
        { method: 'POST' },
      );

export const getTopUpInstruction = (): Promise<TopUpInstruction> =>
  isMocked('wallet') ? walletMock.getTopUpInstruction() : notImplemented('Nạp tiền VietQR');

export const getDueInstallment = (): Promise<DueInstallment> =>
  isMocked('wallet') ? walletMock.getDueInstallment() : notImplemented('Kỳ trả đến hạn');

export const payInstallment = (): Promise<{ ok: true }> =>
  isMocked('wallet') ? walletMock.payInstallment() : notImplemented('Thanh toán kỳ');

/* ---------- Rút tiền về tài khoản ngân hàng (R4, W3B) ---------- */

/** Hạn mức, phí, số dư khả dụng và danh sách ngân hàng nhận của người đang đăng nhập. */
export const getWithdrawalPolicy = (signal?: AbortSignal): Promise<WithdrawalPolicy> =>
  isMocked('wallet')
    ? walletMock.getWithdrawalPolicy()
    : paymentFetch<WithdrawalPolicy>('/wallets/withdrawal-policy', { signal, timeoutMs: 15_000 });

/**
 * Tạo lệnh rút: Payment trừ ví ngay khi nhận lệnh (201, `REQUESTED`) rồi worker mới gửi provider.
 *
 * `idempotencyKey` là khoá của một ý định rút và cũng là khoá đã đưa vào `requirePin('WITHDRAW', key)`: token PIN
 * chỉ mở đúng lệnh mang khoá đó (D38). Gửi lại cùng khoá và cùng nội dung thì Payment trả lại lệnh cũ, không trừ ví
 * lần hai; cùng khoá mà khác nội dung thì bị từ chối `409 WITHDRAWAL_IDEMPOTENCY_CONFLICT`.
 */
export const createWithdrawal = (
  request: CreateWithdrawalRequest,
  idempotencyKey: string,
  pinToken: string,
): Promise<Withdrawal> =>
  isMocked('wallet')
    ? walletMock.createWithdrawal(request)
    : paymentFetch<Withdrawal>('/wallets/me/withdrawals', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey, [PIN_TOKEN_HEADER]: pinToken },
        body: JSON.stringify(request),
        timeoutMs: 15_000,
      });

/** Lịch sử lệnh rút của chính người dùng, mới nhất trước; số tài khoản luôn ở dạng che. */
export const getWithdrawals = (page: number, size: number, signal?: AbortSignal): Promise<WithdrawalPage> =>
  isMocked('wallet')
    ? walletMock.getWithdrawals(page, size)
    : paymentFetch<WithdrawalPage>(`/wallets/me/withdrawals?page=${page}&size=${size}`, { signal, timeoutMs: 15_000 });

/** Một lệnh rút; lệnh của người khác trả 404 như không tồn tại. */
export const getWithdrawal = (withdrawalId: string, signal?: AbortSignal): Promise<Withdrawal> =>
  isMocked('wallet')
    ? walletMock.getWithdrawal(withdrawalId)
    : paymentFetch<Withdrawal>(`/wallets/me/withdrawals/${encodeURIComponent(withdrawalId)}`, {
        signal,
        timeoutMs: 10_000,
      });
