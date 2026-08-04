/**
 * Hợp đồng của `finora-ai` — `POST /api/v1/ai/credit/score`.
 * Bám đúng `app/schemas/credit.py`; không thêm trường nào ngoài schema đó.
 */

/** Giá trị `aiValue` của enum `LoanPurpose` trong `finora-loan`. */
export type AiPurpose =
  | 'debt_consolidation'
  | 'credit_card'
  | 'home_improvement'
  | 'major_purchase'
  | 'medical'
  | 'car'
  | 'small_business'
  | 'moving'
  | 'vacation'
  | 'education'
  | 'other';

export type AiHomeOwnership = 'RENT' | 'OWN' | 'MORTGAGE' | 'OTHER';

export type AiVerificationStatus = 'Verified' | 'Source Verified' | 'Not Verified';

/** Mô hình trả 5 hạng, nhiều hơn một bậc so với bảng A–D của bản thiết kế. */
export type CreditGradeAi = 'A' | 'B' | 'C' | 'D' | 'E';

export type CreditDecision = 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';

export interface CreditScoreRequest {
  /** Bắt buộc. Thu nhập năm (VNĐ) — schema AI không có trường thu nhập tháng. */
  annual_inc: number;
  /** Bắt buộc. Số tiền vay yêu cầu (VNĐ). */
  loan_amnt: number;
  /** Bắt buộc. */
  purpose: AiPurpose;
  /** Bắt buộc. */
  home_ownership: AiHomeOwnership;

  /**
   * Các trường dưới đây tùy chọn. Bỏ trống thì bộ dự đoán điền bằng median
   * trong gói model — tuyệt đối không gửi số bịa để lấp chỗ trống.
   */
  person_age?: number;
  emp_length?: string;
  int_rate?: number;
  term_months?: number;
  verification_status?: AiVerificationStatus;
  dti?: number;
  delinq_2yrs?: number;
  pub_rec?: number;
  installment?: number;
}

export interface CreditScoreResponse {
  pd_probability: number;
  risk_score: number;
  evaluation_score: number;
  credit_grade: CreditGradeAi;
  /** Hạn mức đề xuất (VNĐ), trần 100 triệu theo Nghị định 94/2025. */
  suggested_limit: number;
  decision: CreditDecision;
  rejection_reason: string | null;
  model_version: string;
}
