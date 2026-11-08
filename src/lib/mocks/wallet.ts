import { ApiError } from '@/lib/api';
import { mockResponse } from './delay';
import { deliverMockNotification } from './notification';
import {
  BALANCE,
  DUE_INSTALLMENT,
  TOPUP,
  WALLET_TRANSACTIONS,
  WITHDRAWAL_BANKS,
} from './fixtures';
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
  const linked = linkedAccounts.find(item => item.account.bankAccountId === request.bankAccountId);
  if (!linked) {
    return mockError(
      422,
      'WITHDRAWAL_BANK_ACCOUNT_INVALID',
      'Tài khoản nhận tiền không còn liên kết. Hãy chọn tài khoản khác.',
    );
  }
  const stored: StoredWithdrawal = {
    withdrawalId: `mock-wd-${Date.now()}`,
    amount: request.amount,
    feeAmount: 0,
    currency: 'VND',
    status: 'REQUESTED',
    bankCode: linked.account.bankCode,
    bankName: linked.account.bankName,
    accountNumberMasked: linked.account.accountNumberMasked,
    accountHolderName: linked.account.accountHolderName,
    failureCode: null,
    failureReason: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    invalidAccount: false,
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

/* ---------- Liên kết ngân hàng (BL-001) — chỉ chạy khi miền `wallet` bật mock ---------- */

/** Vài ngân hàng lớn của danh bạ NAPAS; bản thật lấy đủ danh bạ từ Payment. */
const MOCK_BANKS: Bank[] = [
  ['VCB', '970436', 'Vietcombank', 'Ngân hàng TMCP Ngoại Thương Việt Nam'],
  ['ICB', '970415', 'VietinBank', 'Ngân hàng TMCP Công thương Việt Nam'],
  ['BIDV', '970418', 'BIDV', 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam'],
  ['VBA', '970405', 'Agribank', 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam'],
  ['TCB', '970407', 'Techcombank', 'Ngân hàng TMCP Kỹ thương Việt Nam'],
  ['MB', '970422', 'MBBank', 'Ngân hàng TMCP Quân đội'],
  ['ACB', '970416', 'ACB', 'Ngân hàng TMCP Á Châu'],
  ['VPB', '970432', 'VPBank', 'Ngân hàng TMCP Việt Nam Thịnh Vượng'],
  ['TPB', '970423', 'TPBank', 'Ngân hàng TMCP Tiên Phong'],
  ['STB', '970403', 'Sacombank', 'Ngân hàng TMCP Sài Gòn Thương Tín'],
].map(([code, bin, shortName, name]) => ({
  code,
  bin,
  shortName,
  name,
  logoUrl: `https://cdn.vietqr.io/img/${code}.png`,
}));

/** Tên eKYC của người dùng demo; ngân hàng giả lập coi tài khoản thường là của chính người này. */
const MOCK_OWNER_NAME = 'NGUYEN VAN AN';
const MOCK_OTP_TTL_MS = 5 * 60_000;
const MOCK_RESEND_COOLDOWN_MS = 60_000;
const MOCK_OTP_MAX_ATTEMPTS = 5;

type StoredLinkRequest = {
  challenge: BankLinkChallenge;
  accountNumber: string;
  otp: string;
  failedAttempts: number;
  status: 'PENDING' | 'CONFIRMED' | 'LOCKED';
};

let linkRequests: StoredLinkRequest[] = [];
/** Số tài khoản đầy đủ chỉ nằm trong bộ nhớ mock; bản thật nằm mã hoá ở Payment. */
let linkedAccounts: { account: BankAccount; accountNumber: string }[] = [];

const mockError = (status: number, code: string, message: string): Promise<never> =>
  Promise.reject(new ApiError(status, `mock ${code}`, code, message));

const bankOf = (code: string) => MOCK_BANKS.find(bank => bank.code === code);
const maskOf = (accountNumber: string) => `******${accountNumber.slice(-4)}`;
const newOtp = () => String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');

/** Cùng quy ước 4 số cuối với ngân hàng giả lập của Payment. Trả lỗi (đã từ chối) hoặc tên chủ tài khoản. */
function lookUpHolder(request: BankAccountLookupRequest): Promise<never> | string {
  const bank = bankOf(request.bankCode);
  if (!bank) return mockError(422, 'BANK_UNSUPPORTED', 'Ngân hàng này chưa được hỗ trợ');
  const number = request.accountNumber;
  if (number.endsWith('5555')) {
    return mockError(503, 'BANK_UNAVAILABLE', `${bank.shortName} chưa phản hồi. Vui lòng thử lại sau ít phút.`);
  }
  if (number.endsWith('0000')) {
    return mockError(
      422,
      'BANK_ACCOUNT_NOT_EXIST',
      `Không tìm thấy tài khoản này tại ${bank.shortName}. Kiểm tra lại số tài khoản.`,
    );
  }
  if (number.endsWith('9999')) {
    return mockError(422, 'BANK_ACCOUNT_LOCKED', 'Tài khoản đang bị khóa hoặc phong tỏa nên không nhận được tiền.');
  }
  return number.endsWith('1111') ? 'TRAN THI BINH' : MOCK_OWNER_NAME;
}

/** Ngân hàng giả lập "gửi SMS" bằng một tin trong hộp thư, như Notification Service ở bản thật. */
function sendMockOtp(stored: StoredLinkRequest): void {
  const { challenge } = stored;
  deliverMockNotification({
    id: `otp-${challenge.linkRequestId}-${Date.now()}`,
    kind: 'security',
    title: 'Mã xác thực liên kết ngân hàng',
    message:
      `Mã xác thực liên kết tài khoản ${challenge.bankName} ${challenge.accountNumberMasked} là ${stored.otp}, ` +
      'có hiệu lực trong 5 phút. Không chia sẻ mã này cho bất kỳ ai, kể cả nhân viên FINORA.',
    unread: true,
    occurredAt: new Date().toISOString(),
  });
}

export const getBanks = (): Promise<Bank[]> => mockResponse('wallet', MOCK_BANKS);

export const getBankAccounts = (): Promise<BankAccount[]> =>
  mockResponse(
    'wallet',
    linkedAccounts.map(item => item.account).sort((a, b) => Number(b.defaultAccount) - Number(a.defaultAccount)),
  );

export const inquireBankAccount = (request: BankAccountLookupRequest): Promise<BankAccountInquiry> => {
  const holder = lookUpHolder(request);
  if (typeof holder !== 'string') return holder;
  return mockResponse('wallet', {
    bankCode: request.bankCode,
    bankName: bankOf(request.bankCode)?.shortName ?? request.bankCode,
    accountNumberMasked: maskOf(request.accountNumber),
    accountHolderName: holder,
    nameMatched: holder === MOCK_OWNER_NAME,
  });
};

export const startBankLink = (request: BankAccountLookupRequest): Promise<BankLinkChallenge> => {
  const holder = lookUpHolder(request);
  if (typeof holder !== 'string') return holder;
  if (holder !== MOCK_OWNER_NAME) {
    return mockError(
      422,
      'BANK_ACCOUNT_NAME_MISMATCH',
      `Tài khoản đứng tên ${holder}, không trùng họ tên đã xác minh của bạn. ` +
        'Chỉ liên kết được tài khoản ngân hàng đứng tên chính bạn.',
    );
  }
  const duplicate = linkedAccounts.some(
    item => item.account.bankCode === request.bankCode && item.accountNumber === request.accountNumber,
  );
  if (duplicate) return mockError(409, 'BANK_ACCOUNT_ALREADY_LINKED', 'Tài khoản này đã được liên kết.');
  const now = Date.now();
  const stored: StoredLinkRequest = {
    challenge: {
      linkRequestId: `mock-link-${now}`,
      bankCode: request.bankCode,
      bankName: bankOf(request.bankCode)?.shortName ?? request.bankCode,
      accountNumberMasked: maskOf(request.accountNumber),
      accountHolderName: holder,
      otpExpiresAt: new Date(now + MOCK_OTP_TTL_MS).toISOString(),
      resendAvailableAt: new Date(now + MOCK_RESEND_COOLDOWN_MS).toISOString(),
      resendsLeft: 3,
    },
    accountNumber: request.accountNumber,
    otp: newOtp(),
    failedAttempts: 0,
    status: 'PENDING',
  };
  linkRequests = [stored, ...linkRequests];
  sendMockOtp(stored);
  return mockResponse('wallet', stored.challenge);
};

export const resendBankLinkOtp = (linkRequestId: string): Promise<BankLinkChallenge> => {
  const stored = linkRequests.find(item => item.challenge.linkRequestId === linkRequestId);
  if (!stored || stored.status !== 'PENDING') {
    return mockError(409, 'BANK_LINK_NOT_PENDING', 'Yêu cầu liên kết này đã được xử lý.');
  }
  if (stored.challenge.resendsLeft <= 0) {
    return mockError(
      422,
      'BANK_LINK_RESEND_LIMIT',
      'Bạn đã xin gửi lại mã quá số lần cho phép. Hãy bắt đầu liên kết lại.',
    );
  }
  const now = Date.now();
  if (now < new Date(stored.challenge.resendAvailableAt).getTime()) {
    return mockError(429, 'BANK_LINK_RESEND_TOO_SOON', 'Vui lòng chờ một chút rồi gửi lại mã.');
  }
  stored.otp = newOtp();
  stored.failedAttempts = 0;
  stored.challenge = {
    ...stored.challenge,
    otpExpiresAt: new Date(now + MOCK_OTP_TTL_MS).toISOString(),
    resendAvailableAt: new Date(now + MOCK_RESEND_COOLDOWN_MS).toISOString(),
    resendsLeft: stored.challenge.resendsLeft - 1,
  };
  sendMockOtp(stored);
  return mockResponse('wallet', stored.challenge);
};

export const confirmBankLink = (linkRequestId: string, otp: string): Promise<BankAccount> => {
  const stored = linkRequests.find(item => item.challenge.linkRequestId === linkRequestId);
  if (!stored) return mockError(404, 'BANK_LINK_REQUEST_NOT_FOUND', 'Không tìm thấy yêu cầu liên kết');
  const locked = 'Bạn đã nhập sai mã quá số lần cho phép. Hãy bắt đầu liên kết lại.';
  if (stored.status === 'LOCKED') return mockError(422, 'BANK_LINK_LOCKED', locked);
  if (stored.status === 'CONFIRMED') return mockError(409, 'BANK_LINK_NOT_PENDING', 'Yêu cầu liên kết này đã được xử lý.');
  if (Date.now() >= new Date(stored.challenge.otpExpiresAt).getTime()) {
    return mockError(
      422,
      'BANK_LINK_OTP_EXPIRED',
      'Mã xác thực đã hết hạn. Hãy gửi lại mã hoặc bắt đầu liên kết lại.',
    );
  }
  if (otp !== stored.otp) {
    stored.failedAttempts += 1;
    const left = MOCK_OTP_MAX_ATTEMPTS - stored.failedAttempts;
    if (left <= 0) {
      stored.status = 'LOCKED';
      return mockError(422, 'BANK_LINK_LOCKED', locked);
    }
    return mockError(422, 'BANK_LINK_OTP_INVALID', `Mã xác thực không đúng. Bạn còn ${left} lần thử.`);
  }
  stored.status = 'CONFIRMED';
  const account: BankAccount = {
    bankAccountId: `mock-ba-${Date.now()}`,
    bankCode: stored.challenge.bankCode,
    bankName: stored.challenge.bankName,
    bankLogoUrl: bankOf(stored.challenge.bankCode)?.logoUrl ?? null,
    accountNumberMasked: stored.challenge.accountNumberMasked,
    accountHolderName: stored.challenge.accountHolderName,
    defaultAccount: linkedAccounts.length === 0,
    linkedAt: new Date().toISOString(),
  };
  linkedAccounts = [{ account, accountNumber: stored.accountNumber }, ...linkedAccounts];
  return mockResponse('wallet', account);
};

export const setDefaultBankAccount = (bankAccountId: string): Promise<BankAccount> => {
  const target = linkedAccounts.find(item => item.account.bankAccountId === bankAccountId);
  if (!target) return mockError(404, 'BANK_ACCOUNT_NOT_FOUND', 'Không tìm thấy tài khoản đã liên kết');
  linkedAccounts = linkedAccounts.map(item => ({
    ...item,
    account: { ...item.account, defaultAccount: item.account.bankAccountId === bankAccountId },
  }));
  return mockResponse('wallet', { ...target.account, defaultAccount: true });
};

export const removeBankAccount = async (bankAccountId: string): Promise<void> => {
  const target = linkedAccounts.find(item => item.account.bankAccountId === bankAccountId);
  if (!target) return mockError(404, 'BANK_ACCOUNT_NOT_FOUND', 'Không tìm thấy tài khoản đã liên kết');
  await mockResponse('wallet', null);
  linkedAccounts = linkedAccounts.filter(item => item !== target);
  const [next] = linkedAccounts;
  if (target.account.defaultAccount && next) next.account = { ...next.account, defaultAccount: true };
};
