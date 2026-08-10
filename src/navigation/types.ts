import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Bản đồ màn hình. Bốn tab lấy đúng theo hàm `TABBAR` của mockup, và mỗi màn
 * được xếp vào tab mà mockup gán cho nó qua tham số `TABBAR(n)`.
 */

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Otp: { mode: 'login' | 'register' };
  EkycCapture: undefined;
  Liveness: undefined;
  EkycResult: undefined;
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
  MyApplications: undefined;
  ApplicationDetail: { applicationNumber: string };
  MyContracts: undefined;
  ContractDetail: { contractNumber: string };
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
