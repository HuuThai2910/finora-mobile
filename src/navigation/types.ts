import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Bản đồ màn hình. Bốn tab lấy đúng theo hàm `TABBAR` của mockup, và mỗi màn
 * được xếp vào tab mà mockup gán cho nó qua tham số `TABBAR(n)`.
 */

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  /**
   * Xác thực email sau khi khai thông tin đăng ký. Chỉ truyền định danh phiên
   * đăng ký: `email` để gọi API, `maskedEmail` để hiển thị.
   */
  RegisterOtp: { email: string; maskedEmail: string; expiresInSeconds: number };
  ForgotPassword: undefined;
  /** Nhập mã OTP đặt lại mật khẩu. Chỉ truyền `email` đã yêu cầu mã. */
  ResetOtp: { email: string };
  /**
   * Đặt mật khẩu mới. Nhận `otp` từ màn nhập mã vì backend không có endpoint
   * verify riêng — mã chỉ được xác thực thật khi gửi kèm mật khẩu mới.
   */
  ResetPassword: { email: string; otp: string };
};

export type HomeStackParamList = {
  Home: undefined;
  Notifications: undefined;
};

export type MarketStackParamList = {
  Market: undefined;
  LoanDetail: { loanId: string };
  Products: undefined;
  ProductDetail: { productId: number };
  Schedule: { productId: number; amount: number; termMonths: number; expectedDisbursementDate: string };
  VentoPackages: undefined;
  PackageDetail: { code: string };
  ApplyForm: { productId: number; amount: number; termMonths: number; expectedDisbursementDate: string };
};

export type WalletStackParamList = {
  WalletHistory: undefined;
  TopUp: undefined;
  Withdraw: undefined;
  PayInstallment: undefined;
  Portfolio: undefined;
  AutoInvest: undefined;
  InvestContract: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  /** Toàn bộ thông tin `GET /users/me` của tài khoản đang đăng nhập, chỉ đọc. */
  AccountInfo: undefined;
  /**
   * eKYC là chức năng tuỳ chọn mở từ tab Hồ sơ, không ép sau đăng nhập.
   * Chụp một mặt CCCD; mặc định mặt trước — màn tự push chính nó với
   * `side: 'back'`, ảnh đi qua EkycSession chứ không qua params.
   */
  EkycCapture: { side?: 'front' | 'back' } | undefined;
  /** Bản nháp thông tin OCR chờ người dùng soát — xác nhận mới lưu vào hồ sơ. */
  EkycResult: undefined;
  MyApplications: undefined;
  ApplicationDetail: { applicationNumber: string };
  MyContracts: undefined;
  ContractDetail: { contractNumber: string };
  /** Phòng đọc nguyên văn hợp đồng và tạo bản PDF để lưu/chia sẻ. */
  ContractDocument: { contractNumber: string };
  /**
   * Lịch trả nợ đầy đủ tách khỏi màn chi tiết vì có thể tới 60 kỳ.
   * Chỉ truyền định danh; màn tự đọc lại từ cache RTK Query thay vì
   * nhận cả mảng kỳ trả qua params.
   */
  RepaymentSchedule: { source: 'application' | 'contract'; number: string };
  ContractConsent: { contractNumber: string };
};

export type TabParamList = {
  'Trang chủ': NavigatorScreenParams<HomeStackParamList>;
  Sàn: NavigatorScreenParams<MarketStackParamList>;
  Ví: NavigatorScreenParams<WalletStackParamList>;
  'Hồ sơ': NavigatorScreenParams<ProfileStackParamList>;
};
