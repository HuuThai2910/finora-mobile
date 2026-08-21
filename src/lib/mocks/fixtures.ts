/**
 * Số liệu giả port nguyên từ object `S` và từ nội dung 29 màn trong
 * `bản-đẹp.html`, để màn hình hiển thị đúng con số như mockup.
 *
 * Chỉ `api.ts` của từng feature được đọc file này. Component không bao giờ
 * import trực tiếp.
 *
 * Mọi số tiền là số nguyên đồng.
 */
import type { UserProfile } from '@/types/auth';
import type { EkycVerifyResult } from '@/types/ekyc';
import type {
  DueInstallment,
  TopUpInstruction,
  WalletBalance,
  WalletTransaction,
  WithdrawQuote,
} from '@/types/wallet';
import type {
  AutoInvestConfig,
  AutoInvestMatch,
  InvestmentContract,
  MarketLoan,
  PortfolioSummary,
} from '@/types/invest';
import type { AppNotification } from '@/types/notification';
import type {
  LoanContract,
  LoanProgress,
  RepaymentPeriodRow,
  SettlementQuote,
} from '@/types/contract';
import type { LoanProductCatalog, LoanPurpose, RepaymentPreview } from '@/types/loan';

/* ---------------- Hồ sơ người dùng ---------------- */

export const PROFILE: UserProfile = {
  id: 'U-1021',
  fullName: 'Trần Văn Hùng',
  phone: '09xx xxx 842',
  email: 'hung.tran@gmail.com',
  initial: 'H',
  kycStatus: 'KYC_VERIFIED',
  role: 'BORROWER',
  dateOfBirth: '1994-06-12',
  gender: 'MALE',
  placeOfOrigin: 'Nam Định',
  address: '25 Nguyễn Trãi, Thanh Xuân, Hà Nội',
  idNumber: '036094001234',
  creditGrade: 'B',
  creditScore: 78,
  linkedBank: {
    bank: 'Vietcombank',
    maskedNumber: '•••• 8842',
    holder: 'TRẦN VĂN HÙNG',
    verified: true,
  },
};

/** Các mục cài đặt trong màn Hồ sơ cá nhân. */
export const PROFILE_MENU = [
  { icon: 'bank', label: 'Tài khoản ngân hàng liên kết', value: 'VCB •••• 8842' },
  { icon: 'scan', label: 'Sinh trắc học (Face ID)', value: 'Đang bật' },
  { icon: 'shield', label: 'Thiết bị đăng nhập', value: '2 thiết bị' },
  { icon: 'pen', label: 'Chữ ký số', value: 'VNPT SmartCA ✓' },
  { icon: 'bell', label: 'Cài đặt thông báo', value: 'Push + Email' },
  { icon: 'file', label: 'Điều khoản sử dụng', value: 'Cập nhật 07/2026' },
] as const;

/* ---------------- eKYC ---------------- */

export const EKYC_VERIFY_RESULT: EkycVerifyResult = {
  status: 'VERIFIED',
  resultCode: 'VERIFIED',
  ocrWarnings: [],
  message: 'Xác minh eKYC thành công',
};

/* ---------------- Ví ---------------- */

export const BALANCE: WalletBalance = { available: 12_500_000, held: 0 };

export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: 'TX-01', occurredAt: '10/07 21:14', description: 'Nạp ví — VietQR / VCB', amount: 5_000_000, direction: 'in' },
  { id: 'TX-02', occurredAt: '05/07 09:12', description: 'Nhận phân bổ LN-1975 kỳ 7', amount: 842_500, direction: 'in' },
  { id: 'TX-03', occurredAt: '15/06 08:00', description: 'Trả nợ kỳ 3 — LN-1980', amount: 4_320_000, direction: 'out' },
  { id: 'TX-04', occurredAt: '12/06 10:31', description: 'Nhận phân bổ LN-1990 kỳ 4', amount: 480_100, direction: 'in' },
  { id: 'TX-05', occurredAt: '02/06 14:32', description: 'Rút về VCB •••• 8842', amount: 3_000_000, direction: 'out' },
  { id: 'TX-06', occurredAt: '15/05 08:00', description: 'Trả nợ kỳ 2 — LN-1980', amount: 4_320_000, direction: 'out' },
  { id: 'TX-07', occurredAt: '28/04 16:05', description: 'Đầu tư LN-2011 (phong tỏa)', amount: 10_300_000, direction: 'out' },
];

export const TOPUP: TopUpInstruction = {
  qrPayload: 'VIETQR|LC2041884200 31|BIDV',
  virtualAccount: 'LC2041 8842 0031',
  bankName: 'BIDV — chi nhánh HCM',
  transferNote: 'tự sinh theo mã QR',
};

export const WITHDRAW_QUOTE: WithdrawQuote = { fee: 0, estimatedSeconds: 30, channel: 'Napas 247' };

export const DUE_INSTALLMENT: DueInstallment = {
  loanId: 'LN-1980',
  period: 5,
  dueDate: '15/08/2026',
  daysLeft: 35,
  principal: 3_988_000,
  interest: 438_000,
  total: 4_426_000,
  investorCount: 12,
};

/* ---------------- Trang chủ ---------------- */

export const HOME_LOAN = {
  id: 'LN-1980',
  paidPeriods: 4,
  totalPeriods: 12,
  nextPeriod: 5,
  nextDueDate: '15/08/2026',
  nextAmount: 4_426_000,
  gradeLabel: 'Điểm B+ ↑',
};

export const HOME_RECENT = [
  { id: 'H-1', label: 'Nạp ví VietQR', amount: 5_000_000, direction: 'in' as const },
  { id: 'H-2', label: 'Trả nợ kỳ 4', amount: 4_320_000, direction: 'out' as const },
];

export const HOME_CHAIN_REF = { label: 'Hợp đồng on-chain', tx: '0x33d9…41b8' };

/* ---------------- Sàn khoản vay ---------------- */

export const MARKET_LOANS: MarketLoan[] = [
  {
    id: 'LN-2041',
    amount: 60_000_000,
    annualRate: 16.5,
    termMonths: 18,
    purpose: 'Bổ sung vốn kinh doanh tạp hóa',
    region: 'Hà Nội',
    grade: 'A',
    score: 82,
    fundedPercent: 78,
    borrowerHistory: '1 khoản tất toán đúng hạn',
    estimatedMonthlyReturn: 320_000,
    estimatedTotalReturn: 5_760_000,
  },
  {
    id: 'LN-2043',
    amount: 35_000_000,
    annualRate: 18.0,
    termMonths: 12,
    purpose: 'Sửa chữa xe tải chở hàng',
    region: 'Đồng Nai',
    grade: 'B',
    score: 71,
    fundedPercent: 45,
    borrowerHistory: 'Khoản vay đầu tiên',
    estimatedMonthlyReturn: 455_000,
    estimatedTotalReturn: 5_460_000,
  },
  {
    id: 'LN-2044',
    amount: 90_000_000,
    annualRate: 15.0,
    termMonths: 24,
    purpose: 'Mở rộng xưởng may gia công',
    region: 'TP.HCM',
    grade: 'A',
    score: 88,
    fundedPercent: 92,
    borrowerHistory: '2 khoản tất toán đúng hạn',
    estimatedMonthlyReturn: 240_000,
    estimatedTotalReturn: 5_780_000,
  },
  {
    id: 'LN-2046',
    amount: 25_000_000,
    annualRate: 19.0,
    termMonths: 9,
    purpose: 'Nhập hàng bán Tết',
    region: 'Cần Thơ',
    grade: 'C',
    score: 58,
    fundedPercent: 12,
    borrowerHistory: 'Khoản vay đầu tiên',
    estimatedMonthlyReturn: 590_000,
    estimatedTotalReturn: 5_310_000,
  },
];

/* ---------------- Danh mục đầu tư ---------------- */

export const PORTFOLIO: PortfolioSummary = {
  investedAmount: 186_000_000,
  irrPercent: 15.8,
  nplPercent: 2.1,
  positionCount: 28,
  positions: [
    {
      loanId: 'LN-1975',
      sharePercent: 12,
      status: 'ACTIVE',
      note: 'Kỳ 7 nhận +842.500 đ · 11/07',
      lastCashflow: 842_500,
    },
    {
      loanId: 'LN-2031',
      sharePercent: 5,
      status: 'WATCHLIST',
      note: 'Trễ 3 ngày · PD 18% — Early Warning',
    },
    { loanId: 'LN-2044', sharePercent: 4, status: 'FUNDED' },
    { loanId: 'LN-1897', sharePercent: 8, status: 'CLOSED' },
  ],
};

export const AUTO_INVEST: AutoInvestConfig = {
  enabled: true,
  grades: ['A', 'B'],
  minAnnualRate: 15,
  maxTermMonths: 18,
  amountPerLoan: 4_000_000,
  maxPortfolioSharePercent: 5,
};

export const AUTO_INVEST_MATCHES: AutoInvestMatch[] = [
  { at: '10/07 22:10', loanId: 'LN-2044', grade: 'A', annualRate: 15, matched: true, amount: 4_000_000 },
  { at: '09/07 15:44', loanId: 'LN-2046', grade: 'C', annualRate: 19, matched: false },
];

export const INVESTMENT_CONTRACT: InvestmentContract = {
  reference: 'INV_1036EB_1779470224528',
  purpose: 'Vay học phí',
  amount: 10_000_000,
  noteCount: 20,
  termMonths: 9,
  status: 'PENDING_SIGNATURE',
};

/* ---------------- Hồ sơ vay của tôi ---------------- */

export const LOAN_PROGRESS: LoanProgress = {
  applicationId: 'LN-2053',
  amount: 50_000_000,
  termMonths: 24,
  annualRate: 17,
  grade: 'B',
  score: 74,
  raisedAmount: 22_500_000,
  fundedPercent: 45,
  investorCount: 9,
  daysLeft: 12,
};

export const LOAN_PROGRESS_STEPS = [
  { title: 'Nộp hồ sơ', detail: '10/07 · 14:20', state: 'done' as const },
  { title: 'Admin phê duyệt', detail: '10/07 · 16:45 — lên sàn', state: 'done' as const },
  { title: 'Gọi vốn (9 nhà đầu tư)', detail: '45% · còn 12 ngày', state: 'doing' as const },
  { title: 'Ký hợp đồng số', state: 'todo' as const },
  { title: 'Giải ngân về ví', state: 'todo' as const },
];

export const REPAYMENT_ROWS: RepaymentPeriodRow[] = [
  { period: 4, dueDate: '15/07/2026', amount: 4_320_000, status: 'PAID' },
  { period: 5, dueDate: '15/08/2026', amount: 4_426_000, status: 'DUE_SOON' },
  { period: 6, dueDate: '15/09/2026', amount: 4_320_000, status: 'UPCOMING' },
  { period: 7, dueDate: '15/10/2026', amount: 4_320_000, status: 'UPCOMING' },
  { period: 8, dueDate: '15/11/2026', amount: 4_320_000, status: 'UPCOMING' },
  { period: 9, dueDate: '15/12/2026', amount: 4_320_000, status: 'UPCOMING' },
];

export const REPAYMENT_SUMMARY = {
  loanId: 'LN-1980',
  paidPeriods: 4,
  totalPeriods: 12,
  outstandingPrincipal: 32_983_000,
};

export const SETTLEMENT: SettlementQuote = {
  loanId: 'LN-1980',
  outstandingPrincipal: 32_983_000,
  interestToDate: 384_000,
  earlyRepaymentFee: 329_000,
  total: 33_696_000,
  interestSaved: 4_100_000,
};



export const LOAN_CONTRACT: LoanContract = {
  id: 'LN-2053',
  amount: 50_000_000,
  termMonths: 24,
  annualRate: 17,
  investorCount: 14,
  signers: [
    { role: 'Bên vay (bạn)', status: 'PENDING' },
    { role: 'Đại diện bên cho vay', status: 'SIGNED' },
  ],
  documentHash: 'a91f 33e0 7bc2…e4d8',
};

/* ---------------- Thông báo ---------------- */

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'N-1', kind: 'cashflow', message: 'Nhận phân bổ từ LN-1975', highlight: '+842.500 đ', unread: true },
  { id: 'N-2', kind: 'disbursement', message: 'LN-2039 giải ngân thành công — bạn góp 8%', unread: true },
  { id: 'N-3', kind: 'autoinvest', message: 'Auto-Invest khớp LN-2044 (4 tr)', unread: true },
  { id: 'N-4', kind: 'reminder', message: 'Nhắc: kỳ 5 đến hạn sau 35 ngày', unread: false },
  { id: 'N-5', kind: 'chain', message: 'Hợp đồng LN-1980 đã neo Proof of Existence', unread: false },
  { id: 'N-6', kind: 'security', message: 'Đăng nhập mới từ thiết bị lạ — xác minh?', unread: false },
  { id: 'N-7', kind: 'credit', message: 'Điểm tín dụng tăng lên B+ sau kỳ trả đúng hạn', unread: false },
];

/* ---------------- Gói vay VENTO ---------------- */

export const VENTO_PACKAGES = [
  { code: 'PVHP', name: 'Vay học phí', rateLabel: '18%/năm', method: 'Declining Balance' },
  { code: 'PVMDT', name: 'Vay mua điện thoại', rateLabel: '17%/năm', method: 'Declining Balance' },
  { code: 'PLVN', name: 'P2P Lending – VN Standard', rateLabel: '15%/năm', method: 'Theo hạng tín dụng' },
] as const;

export const VENTO_PACKAGE_DETAIL = {
  code: 'PVHP',
  name: 'Vay học phí',
  badge: 'Ưu đãi',
  annualRatePercent: 18,
  monthlyRateLabel: 'Tương đương 1.50% / tháng',
  method: 'Declining Balance',
  amountRange: '1tr – 1000tr đ',
  rateRange: '1% – 20%',
  termRange: '1 – 36 tháng',
  documents: [{ label: 'Giấy báo nhập học', required: true }],
};

/* ---------------- Sản phẩm vay (dự phòng khi backend chưa chạy) ---------------- */

export const PRODUCT_NOTE = 'Lãi suất có thể thay đổi theo chính sách';

/** Ba sản phẩm đúng như mockup, theo shape `LoanProductCatalog` của backend. */
export const FALLBACK_PRODUCTS: LoanProductCatalog[] = [
  {
    id: 1,
    code: 'PVBNPL',
    name: 'BNPL – Mua trước trả sau',
    description: 'Mua trước trả sau cho hàng tiêu dùng',
    minAmount: 5_000_000,
    maxAmount: 200_000_000,
    minTermMonths: 6,
    maxTermMonths: 24,
    annualInterestRate: 12.5,
    interestRateUnit: 'PERCENT_PER_YEAR',
    repaymentMethod: 'ANNUITY',
    rateNotice: PRODUCT_NOTE,
  },
  {
    id: 2,
    code: 'PVHP',
    name: 'Vay học phí',
    description: 'Hỗ trợ đóng học phí theo kỳ',
    minAmount: 1_000_000,
    maxAmount: 1_000_000_000,
    minTermMonths: 3,
    maxTermMonths: 36,
    annualInterestRate: 18.0,
    interestRateUnit: 'PERCENT_PER_YEAR',
    repaymentMethod: 'EQUAL_PRINCIPAL',
    rateNotice: PRODUCT_NOTE,
  },
  {
    id: 3,
    code: 'PLVN',
    name: 'P2P Lending – VN Standard',
    description: 'Sản phẩm cho vay ngang hàng tiêu chuẩn',
    minAmount: 10_000_000,
    maxAmount: 500_000_000,
    minTermMonths: 12,
    maxTermMonths: 48,
    annualInterestRate: 15.0,
    interestRateUnit: 'PERCENT_PER_YEAR',
    repaymentMethod: 'ANNUITY',
    rateNotice: PRODUCT_NOTE,
  },
];

/** Lịch trả nợ dự kiến của mockup — PVHP, 50 tr, 24 tháng. */
export const FALLBACK_PREVIEW: RepaymentPreview = {
  productId: 2,
  amount: 50_000_000,
  termMonths: 24,
  annualInterestRate: 18,
  interestRateUnit: 'PERCENT_PER_YEAR',
  repaymentMethod: 'EQUAL_PRINCIPAL',
  estimatedDisbursementDate: '2026-07-15',
  firstInstallment: 2_610_000,
  maximumInstallment: 2_610_000,
  totalPrincipal: 50_000_000,
  totalInterest: 9_746_000,
  totalFees: 0,
  totalPenalties: 0,
  totalRepayment: 59_746_000,
  calculationPolicyVersion: 'demo-1',
  periods: [
    ['2026-08-15', 2_083_000, 750_000, 2_833_000, 47_917_000],
    ['2026-09-15', 2_083_000, 719_000, 2_802_000, 45_834_000],
    ['2026-10-15', 2_083_000, 688_000, 2_771_000, 43_751_000],
    ['2026-11-15', 2_083_000, 656_000, 2_739_000, 41_668_000],
    ['2026-12-15', 2_083_000, 625_000, 2_708_000, 39_585_000],
    ['2027-01-15', 2_083_000, 594_000, 2_677_000, 37_502_000],
  ].map(([dueDate, principal, interest, totalDue, outstanding], i) => ({
    period: i + 1,
    fromDate: dueDate as string,
    dueDate: dueDate as string,
    daysInPeriod: 30,
    principal: principal as number,
    interest: interest as number,
    fees: 0,
    penalties: 0,
    totalDue: totalDue as number,
    outstandingBalance: outstanding as number,
  })),
};

/** Mục đích vay dùng khi backend chưa trả danh sách. */
export const FALLBACK_PURPOSES: LoanPurpose[] = [
  { code: 'SMALL_BUSINESS', label: 'Kinh doanh nhỏ', aiValue: 'small_business', requiresDetail: true },
  { code: 'CONSUMPTION', label: 'Tiêu dùng', aiValue: 'consumption', requiresDetail: false },
  { code: 'EDUCATION', label: 'Học phí', aiValue: 'educational', requiresDetail: true },
  { code: 'HOME_IMPROVEMENT', label: 'Sửa chữa nhà', aiValue: 'home_improvement', requiresDetail: true },
];
