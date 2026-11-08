import { isMocked } from '@/lib/mockFlag';
import * as walletMock from '@/lib/mocks/wallet';
import { ApiError, generateIdempotencyKey, paymentFetch } from '@/lib/api';
import { PIN_TOKEN_HEADER } from '@/features/pin';
import type {
  Bank,
  BankAccount,
  BankAccountInquiry,
  BankAccountLookupRequest,
  BankLinkChallenge,
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
  throw new ApiError(501, `${what} chưa sẵn sàng, vui lòng thử lại sau.`, 'NOT_IMPLEMENTED');
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

/* ---------- Liên kết tài khoản ngân hàng (BL-001) ---------- */

/** Danh bạ ngân hàng NAPAS của Payment (mã, BIN, tên, logo). */
export const getBanks = (signal?: AbortSignal): Promise<Bank[]> =>
  isMocked('wallet') ? walletMock.getBanks() : paymentFetch<Bank[]>('/wallets/banks', { signal });

/** Tài khoản đang liên kết của chính người dùng, mặc định đứng đầu. */
export const getBankAccounts = (signal?: AbortSignal): Promise<BankAccount[]> =>
  isMocked('wallet') ? walletMock.getBankAccounts() : paymentFetch<BankAccount[]>('/wallets/me/bank-accounts', { signal });

/** Hỏi ngân hàng tên chủ tài khoản; chưa lưu gì. Bị giới hạn số lần mỗi giờ để chống dò tên. */
export const inquireBankAccount = (request: BankAccountLookupRequest): Promise<BankAccountInquiry> =>
  isMocked('wallet')
    ? walletMock.inquireBankAccount(request)
    : paymentFetch<BankAccountInquiry>('/wallets/me/bank-accounts/inquiry', {
        method: 'POST',
        body: JSON.stringify(request),
        timeoutMs: 15_000,
      });

/**
 * Bắt đầu liên kết: Payment tra cứu lại chủ tài khoản rồi yêu cầu ngân hàng gửi OTP. Cần PIN `BANK_ACCOUNT` gắn với
 * đúng `idempotencyKey` (D38); gửi lại cùng khoá trả đúng yêu cầu cũ, không gửi thêm OTP.
 */
export const startBankLink = (
  request: BankAccountLookupRequest,
  idempotencyKey: string,
  pinToken: string,
): Promise<BankLinkChallenge> =>
  isMocked('wallet')
    ? walletMock.startBankLink(request)
    : paymentFetch<BankLinkChallenge>('/wallets/me/bank-accounts', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey, [PIN_TOKEN_HEADER]: pinToken },
        body: JSON.stringify(request),
        timeoutMs: 15_000,
      });

export const resendBankLinkOtp = (linkRequestId: string): Promise<BankLinkChallenge> =>
  isMocked('wallet')
    ? walletMock.resendBankLinkOtp(linkRequestId)
    : paymentFetch<BankLinkChallenge>(`/wallets/me/bank-accounts/link-requests/${linkRequestId}/resend-otp`, {
        method: 'POST',
      });

export const confirmBankLink = (linkRequestId: string, otp: string): Promise<BankAccount> =>
  isMocked('wallet')
    ? walletMock.confirmBankLink(linkRequestId, otp)
    : paymentFetch<BankAccount>(`/wallets/me/bank-accounts/link-requests/${linkRequestId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ otp }),
      });

export const setDefaultBankAccount = (bankAccountId: string): Promise<BankAccount> =>
  isMocked('wallet')
    ? walletMock.setDefaultBankAccount(bankAccountId)
    : paymentFetch<BankAccount>(`/wallets/me/bank-accounts/${bankAccountId}/default`, { method: 'PUT' });

/** Huỷ liên kết cần PIN `BANK_ACCOUNT` gắn với `idempotencyKey`. */
export const removeBankAccount = (bankAccountId: string, idempotencyKey: string, pinToken: string): Promise<void> =>
  isMocked('wallet')
    ? walletMock.removeBankAccount(bankAccountId)
    : paymentFetch<void>(`/wallets/me/bank-accounts/${bankAccountId}`, {
        method: 'DELETE',
        headers: { 'Idempotency-Key': idempotencyKey, [PIN_TOKEN_HEADER]: pinToken },
      });
