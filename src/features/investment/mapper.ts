import type { PortfolioPosition, PortfolioSummary } from '@/types/invest';

/**
 * Chuyển danh mục đầu tư từ contract của Investment Service sang model màn hình.
 */

export interface PortfolioPositionDto {
  loanId: number;
  listingId: number;
  purpose: string | null;
  creditGrade: string | null;
  annualInterestRate: string;
  termMonths: number;
  noteCount: number;
  principalAmount: string;
  outstandingPrincipal: string;
  principalRepaid: string;
  interestReceived: string;
  sharePercent: number;
  status: string;
}

export interface PortfolioDto {
  pendingAmount: string;
  investedAmount: string;
  principalRepaid: string;
  interestReceived: string;
  totalReceived: string;
  activeNoteCount: number;
  positionCount: number;
  weightedAverageRate: number;
  positions: PortfolioPositionDto[];
}

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDong = (value: number): string => new Intl.NumberFormat('vi-VN').format(value);

function toPosition(dto: PortfolioPositionDto): PortfolioPosition {
  const interest = toNumber(dto.interestReceived);
  const repaid = toNumber(dto.principalRepaid);

  return {
    loanId: `#${dto.loanId}`,
    sharePercent: Number(dto.sharePercent.toFixed(2)),
    status: 'ACTIVE',
    note: `${dto.noteCount} Note · đã nhận ${formatDong(repaid + interest)} đ`,
    lastCashflow: interest > 0 ? interest : undefined,
  };
}

export function toPortfolioSummary(dto: PortfolioDto): PortfolioSummary {
  return {
    // Vốn đang nằm trong các Note còn dư nợ; phần chờ giải ngân hiển thị riêng ở ghi chú.
    investedAmount: toNumber(dto.investedAmount),
    // Lãi suất bình quân theo trọng số dư nợ do backend tính; frontend không tự tính lại.
    irrPercent: Number((dto.weightedAverageRate * 100).toFixed(2)),
    // Tỷ lệ nợ xấu do Loan Service sở hữu, Investment chưa có dữ liệu này.
    // Trả null để màn hình hiện dấu gạch thay vì "0%" — 0% là một khẳng định sai
    // về chất lượng danh mục, còn dấu gạch nói đúng rằng chưa có số liệu.
    nplPercent: null,
    positionCount: dto.positionCount,
    positions: dto.positions.map(toPosition),
  };
}
