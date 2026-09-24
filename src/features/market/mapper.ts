import type { CreditGrade } from '@/components/ui/ScoreRing';
import type { MarketLoan } from '@/types/invest';

/**
 * Chuyển contract của Investment Service sang model mà màn hình đang dùng.
 *
 * Backend trả tiền và lãi suất dạng chuỗi decimal để không mất chính xác khi truyền JSON;
 * đây là ranh giới duy nhất được đổi sang number, và chỉ phục vụ hiển thị.
 */

/** Bản chiếu khoản vay trên sàn, đúng như `MarketListingResponse` của backend. */
export interface MarketListingDto {
  listingId: number;
  loanId: number;
  purpose: string;
  region: string;
  creditGrade: string;
  creditScore: number;
  targetAmount: string;
  committedAmount: string;
  remainingAmount: string;
  fundedPercent: number;
  annualInterestRate: string;
  termMonths: number;
  repaymentMethod: string;
  noteDenomination: string;
  minInvestmentAmount: string;
  status: string;
  fundingClosesAt: string;
}

export interface PageDto<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const VALID_GRADES: readonly CreditGrade[] = ['A', 'B', 'C', 'D', 'E'];

/** Hạng lạ từ backend không được làm vỡ giao diện; rơi về 'C' để vẫn hiển thị được. */
const toGrade = (value: string): CreditGrade => {
  const upper = value.trim().toUpperCase();
  return VALID_GRADES.find(grade => grade === upper) ?? 'C';
};

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Ước tính dòng tiền nhận về trên một triệu đồng vốn.
 *
 * Chỉ là con số tham khảo cho người dùng hình dung, tính đơn giản theo lãi suất danh nghĩa.
 * Số tiền chính thức do lịch trả nợ bên Loan/Fineract quyết định — frontend không được
 * dùng con số này để hạch toán.
 */
const estimateReturns = (principal: number, annualRate: number, termMonths: number) => {
  const totalInterest = principal * annualRate * (termMonths / 12);
  return {
    estimatedMonthlyReturn: termMonths > 0 ? Math.round((principal + totalInterest) / termMonths) : 0,
    estimatedTotalReturn: Math.round(totalInterest),
  };
};

export function toMarketLoan(dto: MarketListingDto): MarketLoan {
  const amount = toNumber(dto.targetAmount);
  // Backend lưu lãi suất dạng tỷ lệ (0.1500); giao diện hiển thị theo phần trăm.
  const rate = toNumber(dto.annualInterestRate);
  const { estimatedMonthlyReturn, estimatedTotalReturn } =
    estimateReturns(amount, rate, dto.termMonths);

  return {
    id: String(dto.listingId),
    amount,
    annualRate: Number((rate * 100).toFixed(2)),
    termMonths: dto.termMonths,
    purpose: dto.purpose,
    region: dto.region,
    grade: toGrade(dto.creditGrade),
    score: dto.creditScore,
    fundedPercent: Math.round(dto.fundedPercent),
    // Người vay luôn ẩn danh trên sàn nên không có lịch sử cá nhân; hiển thị phần vốn
    // còn thiếu là thông tin hữu ích hơn cho quyết định đầu tư.
    borrowerHistory: `Còn thiếu ${new Intl.NumberFormat('vi-VN').format(
      toNumber(dto.remainingAmount),
    )} đ`,
    estimatedMonthlyReturn,
    estimatedTotalReturn,
  };
}
