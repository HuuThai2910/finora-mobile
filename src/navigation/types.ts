import type { NavigatorScreenParams } from '@react-navigation/native';
import type { CreateLoanApplicationRequest } from '@/types/loan';

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
  Schedule: { productId: number; amount: number; termMonths: number };
  VentoPackages: undefined;
  PackageDetail: { code: string };
  ApplyForm: { productId?: number } | undefined;
  /**
   * Hồ sơ nháp được truyền nguyên vẹn sang màn chấm điểm: màn đó chấm bằng
   * `finora-ai` rồi nộp đúng nội dung này lên `finora-loan`, không dựng lại
   * dữ liệu từ đầu.
   */
  ScoringResult: { draft: CreateLoanApplicationRequest };
  // Bước ký hợp đồng số tạm ẩn — luồng vay hiện dừng ở bước nộp hồ sơ.
  // SignContract: undefined;
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
  MyLoanProgress: undefined;
  RepaymentSchedule: undefined;
  EarlySettlement: undefined;
};

export type TabParamList = {
  'Trang chủ': NavigatorScreenParams<HomeStackParamList>;
  Sàn: NavigatorScreenParams<MarketStackParamList>;
  Ví: NavigatorScreenParams<WalletStackParamList>;
  'Hồ sơ': NavigatorScreenParams<ProfileStackParamList>;
};
