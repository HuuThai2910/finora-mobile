import type { LoanApplication } from '@/types/loan';

export type RateDirection = 'lower' | 'same' | 'higher';

export type PricingChangeCopy = {
  title: string;
  description: string;
  tone: 'green' | 'blue' | 'amber';
};

/** Điều khoản trước/sau thẩm định của một hồ sơ, đã sẵn sàng để trình bày. */
export type PricingChange = {
  /** Lãi suất cơ sở của sản phẩm tại lúc nộp hồ sơ. */
  baseRate: number;
  /** Lãi suất sau thẩm định do Loan Service chốt. */
  finalRate: number;
  direction: RateDirection;
  /**
   * Borrower chưa trả lời đề nghị: mức sau thẩm định mới là đề nghị, chưa phải
   * điều khoản áp dụng, và hợp đồng chỉ được lập khi họ chủ động chấp nhận.
   */
  pending: boolean;
  copy: PricingChangeCopy;
};

const COPY: Record<RateDirection, PricingChangeCopy> = {
  lower: {
    title: 'Bạn được giảm lãi suất',
    description: 'Kết quả đánh giá tín dụng cho phép áp dụng mức lãi thấp hơn mức cơ sở ban đầu.',
    tone: 'green',
  },
  same: {
    title: 'Lãi suất được giữ nguyên',
    description: 'Kết quả đánh giá không làm thay đổi mức lãi suất cơ sở bạn đã xem khi nộp hồ sơ.',
    tone: 'blue',
  },
  higher: {
    title: 'Lãi suất được điều chỉnh tăng',
    description: 'Mức lãi mới phản ánh kết quả đánh giá tín dụng và vẫn nằm trong khung đã công bố của sản phẩm.',
    tone: 'amber',
  },
};

/** Câu hướng dẫn quyết định, tách theo việc borrower còn phải trả lời đề nghị hay không. */
export const PRICING_CHOICE_NOTES = {
  pending:
    'Hãy đối chiếu lịch trả bên dưới. Hợp đồng chỉ được lập nếu bạn chủ động chấp nhận đề nghị này.',
  autoContinued:
    'Điều khoản không bất lợi hơn nên hồ sơ đã tự tiếp tục theo chấp thuận lúc nộp. Bạn vẫn đọc toàn bộ PDF và quyết định ký hoặc từ chối hợp đồng.',
} as const;

function directionOf(baseRate: number, finalRate: number): RateDirection {
  if (finalRate < baseRate) return 'lower';
  if (finalRate > baseRate) return 'higher';
  return 'same';
}

/**
 * Giải thích điều khoản trước/sau thẩm định bằng dữ liệu Loan đã chốt; không tự
 * tính lãi hay lịch trả và không công khai hạng/chi tiết mô hình cho borrower.
 * Trả `null` khi chưa có điều khoản sau thẩm định (chưa duyệt, hoặc hồ sơ duyệt
 * từ trước khi có định giá nên không có `finalAnnualInterestRate`).
 */
export function pricingChangeOf(application: LoanApplication): PricingChange | null {
  const finalRate = application.finalAnnualInterestRate;
  if (application.status !== 'APPROVED' || finalRate == null) return null;

  const baseRate = application.productSnapshot.annualInterestRate;
  const direction = directionOf(baseRate, finalRate);
  return {
    baseRate,
    finalRate,
    direction,
    pending: application.termsConfirmation?.status === 'PENDING',
    copy: COPY[direction],
  };
}
