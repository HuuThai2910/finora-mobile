import type { LoanApplication } from '@/types/loan';

export type RateDirection = 'lower' | 'same' | 'higher';

export type PricingChangeCopy = {
  tone: 'green' | 'blue' | 'amber';
  /** Lời giải thích chiều thay đổi; lãi giữ nguyên thì không cần báo gì thêm. */
  notice: { title: string; description: string } | null;
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
    tone: "green",
    notice: {
      title: "Bạn được giảm lãi suất",
      description:
        "Kết quả đánh giá tín dụng cho phép áp dụng mức lãi thấp hơn mức cơ sở ban đầu.",
    },
  },
  same: { tone: "blue", notice: null },
  higher: {
    tone: "amber",
    notice: {
      title: "Lãi suất được điều chỉnh tăng",
      description:
        "Lãi suất mới được xác định sau khi xét duyệt hồ sơ và nằm trong khung lãi suất đã công bố.",
    },
  },
};

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
