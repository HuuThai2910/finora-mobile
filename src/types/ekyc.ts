export type LivenessStepStatus = 'passed' | 'processing' | 'pending';

export interface LivenessStep {
  label: string;
  status: LivenessStepStatus;
}

export interface LivenessProgress {
  steps: LivenessStep[];
  /** Số bước đã xong trên tổng, dùng cho dãy chấm tiến độ. */
  completed: number;
  total: number;
}

export interface EkycResult {
  faceMatchScore: number;
  livenessPassed: boolean;
  ocrFullName: string;
  maskedIdNumber: string;
  status: 'KYC_VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
  /** Bằng chứng neo lên sổ cái — mockup hiển thị mã giao dịch và số khối. */
  chainTxId: string;
  chainBlock: number;
}

export interface IdCardCapture {
  side: 'front' | 'back';
  captured: boolean;
}
