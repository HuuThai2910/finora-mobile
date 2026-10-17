import { ApiError } from '@/lib/api';
import { mockResponse } from './delay';
import {
  BALANCE,
  DUE_INSTALLMENT,
  TOPUP,
  WALLET_TRANSACTIONS,
  WITHDRAWAL_BANKS,
} from './fixtures';
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

export const getBalance = (): Promise<WalletBalance> => mockResponse('wallet', BALANCE);

export const getTransactions = (): Promise<WalletTransaction[]> =>
  mockResponse('wallet', WALLET_TRANSACTIONS);

export const getTopUpInstruction = (): Promise<TopUpInstruction> => mockResponse('wallet', TOPUP);

let currentTopUp: TopUpOrder | null = null;

export const createTopUp = (amount: number): Promise<TopUpOrder> => {
  currentTopUp = {
    topUpId: `mock-${Date.now()}`,
    amount,
    currency: 'VND',
    provider: 'MOCK',
    providerOrderId: `MOCK-${Date.now()}`,
    providerReference: null,
    checkoutUrl: null,
    qrPayload: TOPUP.qrPayload,
    status: 'AWAITING_PAYMENT',
    errorCode: null,
    errorDetail: null,
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    completedAt: null,
    mockCompletionAvailable: true,
  };
  return mockResponse('wallet', currentTopUp);
};

export const getTopUp = (topUpId: string): Promise<TopUpOrder> =>
  mockResponse('wallet', currentTopUp ?? {
    topUpId,
    amount: 0,
    currency: 'VND',
    provider: 'MOCK',
    providerOrderId: topUpId,
    providerReference: null,
    checkoutUrl: null,
    qrPayload: null,
    status: 'FAILED',
    errorCode: 'TOPUP_NOT_FOUND',
    errorDetail: 'Không tìm thấy lệnh nạp',
    expiresAt: null,
    completedAt: null,
    mockCompletionAvailable: false,
  });

export const completeTopUp = (topUpId: string): Promise<TopUpOrder> => {
  if (currentTopUp?.topUpId === topUpId) {
    currentTopUp = {
      ...currentTopUp,
      status: 'COMPLETED',
      providerReference: `MOCK-PAID-${topUpId}`,
      completedAt: new Date().toISOString(),
      mockCompletionAvailable: false,
    };
  }
  return getTopUp(topUpId);
};

export const getDueInstallment = (): Promise<DueInstallment> =>
  mockResponse('wallet', DUE_INSTALLMENT);

/** Trả nợ từ ví — bản mock chỉ xác nhận, không đổi số dư lưu trữ. */
export const payInstallment = (): Promise<{ ok: true }> => mockResponse('wallet', { ok: true });

/* ---------- Rút tiền (R4) — chỉ chạy khi miền `wallet` bật mock ---------- */

/** Policy demo mặc định của Payment (Q4/D19): tối thiểu 50.000 đ, 50 triệu/ngày, không phí. */
const MOCK_WITHDRAWAL_MINIMUM = 50_000;
const MOCK_WITHDRAWAL_DAILY_LIMIT = 50_000_000;

/** Provider giả lập của Payment gọi callback sau vài giây; bản mock đổi trạng thái theo thời gian đã trôi qua. */
const MOCK_PAYOUT_SETTLE_MS = 4_000;

type StoredWithdrawal = Withdrawal & { invalidAccount: boolean };

/** Lệnh rút giả trong bộ nhớ, mới nhất đứng đầu. Không đổi số dư `BALANCE`, như các mock ví khác. */
let mockWithdrawals: StoredWithdrawal[] = [];

/** Số tài khoản kết thúc `0000` mô phỏng tài khoản sai (thất bại, hoàn tiền), như provider mock của Payment. */
function currentView({ invalidAccount, ...withdrawal }: StoredWithdrawal): Withdrawal {
  const createdAt = new Date(withdrawal.createdAt).getTime();
  if (Date.now() - createdAt < MOCK_PAYOUT_SETTLE_MS) return { ...withdrawal, status: 'PROVIDER_PENDING' };
  if (invalidAccount) {
    return {
      ...withdrawal,
      status: 'FAILED',
      failureCode: 'MOCK_ACCOUNT_INVALID',
      failureReason: 'Tài khoản nhận không hợp lệ (provider giả lập)',
    };
  }
  return { ...withdrawal, status: 'COMPLETED', completedAt: new Date(createdAt + MOCK_PAYOUT_SETTLE_MS).toISOString() };
}

export const getWithdrawalPolicy = (): Promise<WithdrawalPolicy> => {
  const usedToday = mockWithdrawals
    .map(currentView)
    .filter(item => item.status !== 'FAILED')
    .reduce((sum, item) => sum + item.amount, 0);
  return mockResponse('wallet', {
    minimumAmount: MOCK_WITHDRAWAL_MINIMUM,
    dailyLimit: MOCK_WITHDRAWAL_DAILY_LIMIT,
    feeAmount: 0,
    // Ngày theo giờ Việt Nam (UTC+7), như ngày nghiệp vụ của Payment.
    businessDate: new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10),
    usedToday,
    remainingToday: Math.max(0, MOCK_WITHDRAWAL_DAILY_LIMIT - usedToday),
    availableBalance: BALANCE.available,
    simulatedProvider: true,
    banks: WITHDRAWAL_BANKS,
  });
};

export const createWithdrawal = (request: CreateWithdrawalRequest): Promise<Withdrawal> => {
  const stored: StoredWithdrawal = {
    withdrawalId: `mock-wd-${Date.now()}`,
    amount: request.amount,
    feeAmount: 0,
    currency: 'VND',
    status: 'REQUESTED',
    bankCode: request.bankCode,
    bankName: WITHDRAWAL_BANKS.find(bank => bank.code === request.bankCode)?.name ?? request.bankCode,
    accountNumberMasked: `******${request.accountNumber.slice(-4)}`,
    accountHolderName: request.accountHolderName,
    failureCode: null,
    failureReason: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    invalidAccount: request.accountNumber.endsWith('0000'),
  };
  mockWithdrawals = [stored, ...mockWithdrawals];
  return mockResponse('wallet', { ...currentView(stored), status: 'REQUESTED' });
};

export const getWithdrawals = (page: number, size: number): Promise<WithdrawalPage> => {
  const content = mockWithdrawals.slice(page * size, (page + 1) * size).map(currentView);
  const totalPages = Math.ceil(mockWithdrawals.length / size);
  return mockResponse('wallet', {
    content,
    page,
    size,
    totalElements: mockWithdrawals.length,
    totalPages,
    last: page + 1 >= totalPages,
  });
};

export const getWithdrawal = (withdrawalId: string): Promise<Withdrawal> => {
  const stored = mockWithdrawals.find(item => item.withdrawalId === withdrawalId);
  return stored
    ? mockResponse('wallet', currentView(stored))
    : Promise.reject(new ApiError(404, 'mock withdrawal not found', 'WITHDRAWAL_NOT_FOUND', 'Không tìm thấy lệnh rút tiền'));
};
