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
  BorrowerProfile,
  BorrowerRuleResult,
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
  id: 'BORROWER-001',
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
  { icon: 'bank', label: 'Ngân hàng liên kết', value: 'VCB •••• 8842' },
  { icon: 'scan', label: 'Sinh trắc học (Face ID)', value: 'Đang bật' },
  { icon: 'shield', label: 'Thiết bị đăng nhập', value: '2 thiết bị' },
  { icon: 'pen', label: 'Chữ ký số', value: 'VNPT SmartCA ✓' },
  { icon: 'bell', label: 'Cài đặt thông báo', value: 'Push + Email' },
  { icon: 'file', label: 'Điều khoản', value: 'Cập nhật 07/2026' },
] as const;

/* ---------------- eKYC ---------------- */

export const EKYC_DRAFT_RESULT: EkycVerifyResult = {
  status: 'PENDING',
  resultCode: 'DRAFT_READY',
  ocrWarnings: [],
  message: 'Kiểm tra thông tin đọc được từ CCCD rồi xác nhận',
  draft: {
    idNumber: '036094001234',
    fullName: 'TRẦN VĂN HÙNG',
    dateOfBirth: '12/06/1994',
    gender: 'Nam',
    placeOfOrigin: 'Nam Định',
    address: '25 Nguyễn Trãi, Thanh Xuân, Hà Nội',
  },
};

/* ---------------- Ví ---------------- */

export const BALANCE: WalletBalance = { available: 12_500_000, held: 0 };

export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: 'TX-01', occurredAt: '2026-07-10T21:14:00+07:00', description: 'Nạp ví — VietQR / VCB', amount: 5_000_000, direction: 'in' },
  { id: 'TX-02', occurredAt: '2026-07-05T09:12:00+07:00', description: 'Nhận phân bổ LN-1975 kỳ 7', amount: 842_500, direction: 'in' },
  { id: 'TX-03', occurredAt: '2026-06-15T08:00:00+07:00', description: 'Trả nợ kỳ 3 — LN-1980', amount: 4_320_000, direction: 'out' },
  { id: 'TX-04', occurredAt: '2026-06-12T10:31:00+07:00', description: 'Nhận phân bổ LN-1990 kỳ 4', amount: 480_100, direction: 'in' },
  { id: 'TX-05', occurredAt: '2026-06-02T14:32:00+07:00', description: 'Rút về VCB •••• 8842', amount: 3_000_000, direction: 'out' },
  { id: 'TX-06', occurredAt: '2026-05-15T08:00:00+07:00', description: 'Trả nợ kỳ 2 — LN-1980', amount: 4_320_000, direction: 'out' },
  { id: 'TX-07', occurredAt: '2026-04-28T16:05:00+07:00', description: 'Đầu tư LN-2011 (phong tỏa)', amount: 10_300_000, direction: 'out' },
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

/**
 * Giờ của giao dịch demo tính lùi từ lúc mở app, để trang chủ luôn hiện
 * "Hôm nay"/"Hôm qua" như mockup thay vì một ngày cố định trôi dần về quá khứ.
 */
const demoTime = (daysAgo: number, hours: number, minutes: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const HOME_RECENT = [
  {
    id: 'H-1',
    label: 'Nạp ví VietQR',
    amount: 5_000_000,
    direction: 'in' as const,
    occurredAt: demoTime(0, 10, 24),
  },
  {
    id: 'H-2',
    label: 'Trả nợ kỳ 4',
    amount: 4_320_000,
    direction: 'out' as const,
    occurredAt: demoTime(1, 15, 30),
  },
];

export const HOME_CHAIN_REF = {
  // Ký tự nối từ vô hình (U+2060) quanh dấu gạch: máy màn hẹp ngắt thành
  // "Hợp đồng / on-chain" thay vì "Hợp đồng on- / chain". Font Be Vietnam Pro
  // không có gạch nối không ngắt (U+2011) nên không dùng được ký tự đó.
  label: 'Hợp đồng on⁠-⁠chain',
  tx: '0x33d9…41b8',
  occurredAt: '2026-09-12T09:18:00+07:00',
};

/* ---------------- Sàn khoản vay ---------------- */

/** Hạn gọi vốn tính từ lúc mở app, để khoản vay mẫu luôn còn đang mở khi demo. */
const daysFromNow = (days: number): string => new Date(Date.now() + days * 86_400_000).toISOString();

/**
 * Tham số sàn lấy theo giá trị khởi tạo của Investment (mệnh giá 1 triệu, tối thiểu một Note);
 * phần đã gọi luôn là bội số mệnh giá như dữ liệu thật.
 */
const NOTE_TERMS = { noteDenomination: 1_000_000, minInvestmentAmount: 1_000_000, status: 'OPEN' } as const;

export const MARKET_LOANS: MarketLoan[] = [
  {
    id: 'LN-2041',
    applicationNumber: 'LA-MOCK-2041',
    amount: 60_000_000,
    committedAmount: 47_000_000,
    remainingAmount: 13_000_000,
    annualRate: 16.5,
    termMonths: 18,
    repaymentMethod: 'EQUAL_PRINCIPAL',
    purpose: 'Bổ sung vốn kinh doanh tạp hóa',
    region: 'Hà Nội',
    grade: 'A',
    score: 82,
    fundedPercent: 78,
    ...NOTE_TERMS,
    fundingClosesAt: daysFromNow(9),
  },
  {
    id: 'LN-2043',
    applicationNumber: 'LA-MOCK-2043',
    amount: 35_000_000,
    committedAmount: 16_000_000,
    remainingAmount: 19_000_000,
    annualRate: 18.0,
    termMonths: 12,
    repaymentMethod: 'ANNUITY',
    purpose: 'Sửa chữa xe tải chở hàng',
    region: 'Đồng Nai',
    grade: 'B',
    score: 71,
    fundedPercent: 46,
    ...NOTE_TERMS,
    fundingClosesAt: daysFromNow(5),
  },
  {
    id: 'LN-2044',
    applicationNumber: 'LA-MOCK-2044',
    amount: 90_000_000,
    committedAmount: 83_000_000,
    remainingAmount: 7_000_000,
    annualRate: 15.0,
    termMonths: 24,
    repaymentMethod: 'EQUAL_PRINCIPAL',
    purpose: 'Mở rộng xưởng may gia công',
    region: 'TP.HCM',
    grade: 'A',
    score: 88,
    fundedPercent: 92,
    ...NOTE_TERMS,
    fundingClosesAt: daysFromNow(2),
  },
  {
    id: 'LN-2046',
    applicationNumber: 'LA-MOCK-2046',
    amount: 25_000_000,
    committedAmount: 3_000_000,
    remainingAmount: 22_000_000,
    annualRate: 19.0,
    termMonths: 9,
    repaymentMethod: 'ANNUITY',
    purpose: 'Nhập hàng bán Tết',
    region: 'Cần Thơ',
    grade: 'C',
    score: 58,
    fundedPercent: 12,
    ...NOTE_TERMS,
    fundingClosesAt: daysFromNow(12),
  },
];

/* ---------------- Hồ sơ người vay của khoản vay trên sàn (Loan Service) ---------------- */

/** Mô tả năm luật của chính sách tín dụng hiện hành, chép từ `finora-ai/config/product_config.json`. */
const RULE_TEXT = {
  burden: 'Tiền trả hàng tháng trên thu nhập tháng — càng thấp càng tốt',
  dti: 'Tỷ lệ nợ trên thu nhập hiện có (DTI) — càng thấp càng tốt',
  seeking: 'Số lần bị tra cứu CIC 6 tháng — tìm vốn dồn dập là dấu hiệu khát tiền',
  cic: 'Điểm tín dụng CIC — lịch sử trả nợ tại các tổ chức tín dụng',
  home: 'Tình trạng nhà ở — đại diện cho tài sản tích lũy và độ ổn định cư trú',
};

/**
 * Bảng luật mẫu: mỗi luật tối đa 20 điểm, tổng điểm bằng `score` của khoản vay trên sàn. CIC `null`
 * là thiếu dữ liệu (AI cho điểm trung tính 8) để xem được dòng "thiếu dữ liệu".
 */
const mockRules = (
  values: { burden: number; dti: number; inquiries: number; cic: number | null; home: string },
  points: [number, number, number, number, number],
): BorrowerRuleResult[] => [
  { code: 'CAPACITY_INSTALLMENT_BURDEN', description: RULE_TEXT.burden, field: 'ty_le_tra_no_thang', value: values.burden, points: points[0], maxPoints: 20, weight: 1, missingData: false },
  { code: 'CAPACITY_EXISTING_DEBT', description: RULE_TEXT.dti, field: 'dti', value: values.dti, points: points[1], maxPoints: 20, weight: 1, missingData: false },
  { code: 'CHARACTER_CREDIT_SEEKING', description: RULE_TEXT.seeking, field: 'so_lan_tra_cuu', value: values.inquiries, points: points[2], maxPoints: 20, weight: 1, missingData: false },
  { code: 'CHARACTER_CIC_HISTORY', description: RULE_TEXT.cic, field: 'cic_score', value: values.cic, points: points[3], maxPoints: 20, weight: 1, missingData: values.cic === null },
  { code: 'CAPITAL_RESIDENCE_STABILITY', description: RULE_TEXT.home, field: 'home_ownership', value: values.home, points: points[4], maxPoints: 20, weight: 1, missingData: false },
];

const NO_FINORA_HISTORY = { hasHistory: false, completedLoans: 0, delinquenciesLast2Years: 0, defaultedLoans: 0 };

/** Theo `applicationNumber` của `MARKET_LOANS`; LA-MOCK-2046 dùng hồ sơ giả lập để xem ghi chú tương ứng. */
export const BORROWER_PROFILES: Record<string, BorrowerProfile> = {
  'LA-MOCK-2041': {
    applicationNumber: 'LA-MOCK-2041',
    loan: {
      purposeLabel: 'Vốn kinh doanh nhỏ', purposeDetail: 'Nhập thêm hàng cho tiệm tạp hóa trước mùa cao điểm',
      requestedAmount: 60_000_000, termMonths: 18, repaymentMethod: 'EQUAL_PRINCIPAL', finalAnnualRate: 16.5,
      firstInstallment: 4_158_333, maximumInstallment: 4_158_333, totalRepayment: 67_837_500,
      expectedDisbursementDate: daysFromNow(14).slice(0, 10),
    },
    capacity: { monthlyIncome: 45_000_000, monthlyDebt: 3_600_000, dtiPercent: 8, employmentMonths: 84, selfDeclared: true, capturedAt: daysFromNow(-6) },
    background: { age: 38, kycStatus: 'VERIFIED', mockProfile: false, homeOwnership: 'MORTGAGE', educationLevel: 'COLLEGE' },
    creditHistory: { hasHistory: true, completedLoans: 1, delinquenciesLast2Years: 0, defaultedLoans: 0 },
    assessment: { evaluationScore: 86.4, grade: 'A', pdPercent: 11.8, ruleScore: 82, decisionSource: 'AI_POLICY', scoredAt: daysFromNow(-6) },
    rules: mockRules({ burden: 0.0924, dti: 8, inquiries: 2, cic: 752, home: 'MORTGAGE' }, [20, 20, 6, 20, 16]),
  },
  'LA-MOCK-2043': {
    applicationNumber: 'LA-MOCK-2043',
    loan: {
      purposeLabel: 'Mua hoặc sửa chữa xe', purposeDetail: 'Sửa chữa xe tải chở hàng',
      requestedAmount: 35_000_000, termMonths: 12, repaymentMethod: 'ANNUITY', finalAnnualRate: 18,
      firstInstallment: 3_208_800, maximumInstallment: 3_208_800, totalRepayment: 38_505_600,
      expectedDisbursementDate: daysFromNow(10).slice(0, 10),
    },
    capacity: { monthlyIncome: 18_000_000, monthlyDebt: 1_600_000, dtiPercent: 8.89, employmentMonths: 30, selfDeclared: true, capturedAt: daysFromNow(-4) },
    background: { age: 29, kycStatus: 'VERIFIED', mockProfile: false, homeOwnership: 'RENT', educationLevel: 'HIGH_SCHOOL' },
    creditHistory: NO_FINORA_HISTORY,
    assessment: { evaluationScore: 74.1, grade: 'B', pdPercent: 22.4, ruleScore: 71, decisionSource: 'ADMIN', scoredAt: daysFromNow(-4) },
    rules: mockRules({ burden: 0.1783, dti: 8.89, inquiries: 0, cic: null, home: 'RENT' }, [15, 20, 20, 8, 8]),
  },
  'LA-MOCK-2044': {
    applicationNumber: 'LA-MOCK-2044',
    loan: {
      purposeLabel: 'Vốn kinh doanh nhỏ', purposeDetail: 'Mở rộng xưởng may gia công: mua thêm 6 máy may công nghiệp',
      requestedAmount: 90_000_000, termMonths: 24, repaymentMethod: 'EQUAL_PRINCIPAL', finalAnnualRate: 15,
      firstInstallment: 4_875_000, maximumInstallment: 4_875_000, totalRepayment: 104_062_500,
      expectedDisbursementDate: daysFromNow(7).slice(0, 10),
    },
    capacity: { monthlyIncome: 65_000_000, monthlyDebt: 3_900_000, dtiPercent: 6, employmentMonths: 120, selfDeclared: true, capturedAt: daysFromNow(-9) },
    background: { age: 41, kycStatus: 'VERIFIED', mockProfile: false, homeOwnership: 'OWN', educationLevel: 'UNIVERSITY' },
    creditHistory: { hasHistory: true, completedLoans: 2, delinquenciesLast2Years: 0, defaultedLoans: 0 },
    assessment: { evaluationScore: 88.2, grade: 'A', pdPercent: 9.6, ruleScore: 88, decisionSource: 'AI_POLICY', scoredAt: daysFromNow(-9) },
    rules: mockRules({ burden: 0.075, dti: 6, inquiries: 1, cic: 715, home: 'OWN' }, [20, 20, 13, 15, 20]),
  },
  'LA-MOCK-2046': {
    applicationNumber: 'LA-MOCK-2046',
    loan: {
      purposeLabel: 'Vốn kinh doanh nhỏ', purposeDetail: 'Nhập hàng bán Tết',
      requestedAmount: 25_000_000, termMonths: 9, repaymentMethod: 'ANNUITY', finalAnnualRate: 19,
      firstInstallment: 3_002_400, maximumInstallment: 3_002_400, totalRepayment: 27_021_600,
      expectedDisbursementDate: daysFromNow(16).slice(0, 10),
    },
    capacity: { monthlyIncome: 11_000_000, monthlyDebt: 2_900_000, dtiPercent: 26.36, employmentMonths: 14, selfDeclared: true, capturedAt: daysFromNow(-2) },
    background: { age: 30, kycStatus: 'VERIFIED', mockProfile: true, homeOwnership: 'MORTGAGE', educationLevel: null },
    creditHistory: NO_FINORA_HISTORY,
    assessment: { evaluationScore: 58.7, grade: 'C', pdPercent: 33.9, ruleScore: 58, decisionSource: 'ADMIN', scoredAt: daysFromNow(-2) },
    rules: mockRules({ burden: 0.2729, dti: 26.36, inquiries: 3, cic: 742, home: 'MORTGAGE' }, [8, 8, 6, 20, 16]),
  },
};

/* ---------------- Danh mục đầu tư ---------------- */

export const PORTFOLIO: PortfolioSummary = {
  investedAmount: 46_400_000,
  pendingAmount: 20_000_000,
  principalRepaid: 3_600_000,
  interestReceived: 1_284_500,
  totalReceived: 4_884_500,
  activeNoteCount: 50,
  positionCount: 3,
  averageRate: 14.62,
  positions: [
    {
      loanId: 3041, listingId: 31, purpose: 'Mở rộng cửa hàng tạp hoá', grade: 'A', annualRate: 13.5,
      termMonths: 12, noteCount: 20, principal: 20_000_000, outstanding: 16_400_000,
      principalRepaid: 3_600_000, interestReceived: 812_000, sharePercent: 20,
      daysPastDue: 0, debtGroup: 1, overdueAmount: 0, servicingStatus: 'ACTIVE', maturityDate: null, riskDataAsOf: null,
    },
    {
      loanId: 2044, listingId: 24, purpose: 'Học phí cao học', grade: 'B', annualRate: 15,
      termMonths: 9, noteCount: 20, principal: 20_000_000, outstanding: 20_000_000,
      principalRepaid: 0, interestReceived: 472_500, sharePercent: 10,
      daysPastDue: 12, debtGroup: 2, overdueAmount: 1_250_000, servicingStatus: 'ACTIVE', maturityDate: null, riskDataAsOf: '2026-10-04T00:00:00Z',
    },
    {
      loanId: 1877, listingId: 18, purpose: 'Sửa chữa nhà', grade: 'D', annualRate: 18,
      termMonths: 6, noteCount: 10, principal: 10_000_000, outstanding: 10_000_000,
      principalRepaid: 0, interestReceived: 0, sharePercent: 25,
      daysPastDue: 0, debtGroup: 1, overdueAmount: 0, servicingStatus: 'ACTIVE', maturityDate: null, riskDataAsOf: null,
    },
  ],
};

export const AUTO_INVEST: AutoInvestConfig = {
  enabled: true,
  grades: ['A', 'B'],
  minAnnualRate: 15,
  maxTermMonths: 18,
  amountPerLoan: 4_000_000,
};

export const AUTO_INVEST_MATCHES: AutoInvestMatch[] = [
  { at: '2026-07-10T15:10:00Z', loanId: 'LN-2044', grade: 'A', annualRate: 15, matched: true, amount: 4_000_000 },
  { at: '2026-07-09T08:44:00Z', loanId: 'LN-2046', grade: 'B', annualRate: 16, matched: false, reason: 'INSUFFICIENT_FUNDS' },
];

export const INVESTMENT_CONTRACT: InvestmentContract = {
  reference: 'INV_1036EB_1779470224528',
  purpose: 'Vay học phí',
  amount: 10_000_000,
  noteCount: 20,
  termMonths: 9,
  status: 'PENDING_SIGNATURE',
  contractStatus: 'PENDING_LENDER_SIGNATURES',
  version: 0,
  documentHash: 'a'.repeat(64),
  pdfDocumentHash: 'b'.repeat(64),
  remainingLenderSignatures: 2,
  availableSignatureProvider: 'MOCK',
  availableSignatureMethod: 'CLICK_WRAP_MVP',
  downloadPath: '/investor/loan-contracts/INV_1036EB_1779470224528/document',
  expiresAt: '2026-10-03T00:00:00Z',
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

/** Lùi `minutes` phút từ lúc mở app: tin "vừa xong" luôn nằm trong quá khứ, kể cả lúc nửa đêm. */
const minutesAgo = (minutes: number): string => new Date(Date.now() - minutes * 60_000).toISOString();

/**
 * Tin mẫu rải trong hôm nay, hôm qua và vài ngày trước để màn Thông báo đủ các
 * nhóm ngày. Tin dòng tiền, cơ cấu và quá hạn viết theo mẫu câu của
 * finora-notification; giải ngân, Auto-Invest, sổ cái, bảo mật chưa có backend
 * phát tin nên câu chữ chỉ là minh hoạ.
 */
export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'N-1',
    kind: 'cashflow',
    title: 'Đã nhận khoản trả nợ',
    message: 'LN-1975 vừa phân bổ 842.500 đ vào các Note của bạn.',
    highlight: '842.500 đ',
    unread: true,
    occurredAt: minutesAgo(18),
  },
  {
    id: 'N-2',
    kind: 'disbursement',
    title: 'Khoản vay đã giải ngân',
    message: 'LN-2039 giải ngân thành công, bạn góp 8% vốn.',
    unread: true,
    occurredAt: minutesAgo(95),
  },
  {
    id: 'N-3',
    kind: 'autoinvest',
    title: 'Auto-Invest đã khớp lệnh',
    message: 'Đã rót 4.000.000 đ vào LN-2044 theo tiêu chí bạn đặt.',
    highlight: '4.000.000 đ',
    unread: true,
    occurredAt: demoTime(1, 20, 41),
  },
  {
    id: 'N-4',
    kind: 'reminder',
    title: 'Lịch trả nợ đã được cơ cấu',
    message: 'LN-1980 có ngày đáo hạn mới 15/04/2027.',
    unread: false,
    occurredAt: demoTime(1, 9, 5),
  },
  {
    id: 'N-5',
    kind: 'risk',
    title: 'Khoản vay đang quá hạn',
    message: 'LN-1990 đang quá hạn 12 ngày.',
    unread: false,
    occurredAt: demoTime(3, 8, 30),
  },
  {
    id: 'N-6',
    kind: 'chain',
    title: 'Hợp đồng đã neo lên sổ cái',
    message: 'Mã băm hợp đồng LN-1980 đã được ghi lên blockchain để đối chiếu.',
    unread: false,
    occurredAt: demoTime(4, 14, 2),
  },
  {
    id: 'N-7',
    kind: 'security',
    title: 'Đăng nhập trên thiết bị mới',
    message: 'Nếu không phải bạn, hãy đổi mật khẩu ngay.',
    unread: false,
    occurredAt: demoTime(6, 22, 15),
  },
  {
    id: 'N-8',
    kind: 'credit',
    title: 'Điểm tín dụng được cập nhật',
    message: 'Bạn trả đúng hạn kỳ 4, điểm tín dụng tăng lên B+.',
    unread: false,
    occurredAt: demoTime(9, 10, 0),
  },
];

/* ---------------- Gói vay VENTO ---------------- */

/**
 * Mockup "Gói vay ưu đãi" (26/09/2026) thêm dòng đối tượng dưới tên gói và ba
 * cột Hạn mức / Thời hạn / Hình thức. Bản cũ chưa có các trường này nên số liệu
 * lấy theo mockup; `audience` và `form` của gói điện thoại / P2P mockup không ghi
 * rõ, là giá trị minh hoạ tự đặt.
 */
export const VENTO_PACKAGES = [
  {
    code: 'PVHP',
    name: 'Vay học phí',
    rateLabel: '18%/năm',
    method: 'Declining Balance',
    audience: 'Dành riêng sinh viên',
    minAmount: 5_000_000,
    maxAmount: 100_000_000,
    minTermMonths: 6,
    maxTermMonths: 36,
    form: 'Theo học phí',
  },
  {
    code: 'PVMDT',
    name: 'Vay mua điện thoại',
    rateLabel: '17%/năm',
    method: 'Declining Balance',
    audience: 'Mua máy trả góp',
    minAmount: 3_000_000,
    maxAmount: 50_000_000,
    minTermMonths: 6,
    maxTermMonths: 24,
    form: 'Hóa đơn mua hàng',
  },
  {
    code: 'PLVN',
    name: 'P2P Lending – VN Standard',
    rateLabel: '15%/năm',
    method: 'Theo hạng tín dụng',
    audience: 'Theo hạng tín dụng',
    minAmount: 10_000_000,
    maxAmount: 500_000_000,
    minTermMonths: 6,
    maxTermMonths: 36,
    form: 'Gọi vốn P2P',
  },
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
    minAnnualInterestRate: 12,
    annualInterestRate: 12.5,
    maxAnnualInterestRate: 13.5,
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
    maxTermMonths: 24,
    minAnnualInterestRate: 17,
    annualInterestRate: 18.0,
    maxAnnualInterestRate: 19,
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
    maxTermMonths: 24,
    minAnnualInterestRate: 14.5,
    annualInterestRate: 15.0,
    maxAnnualInterestRate: 16,
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
