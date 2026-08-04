/** Mọi số tiền là số nguyên đồng — không dùng số thực cho tiền. */
export interface WalletBalance {
  available: number;
  held: number;
}

export type WalletTxDirection = 'in' | 'out';

export interface WalletTransaction {
  id: string;
  /** Ngày giờ đã format sẵn theo mockup, ví dụ "10/07 21:14". */
  occurredAt: string;
  description: string;
  amount: number;
  direction: WalletTxDirection;
}

export interface TopUpInstruction {
  /** Chuỗi mã hoá trong ảnh QR. */
  qrPayload: string;
  virtualAccount: string;
  bankName: string;
  transferNote: string;
}

export interface LinkedBankAccount {
  bank: string;
  maskedNumber: string;
  holder: string;
  verified: boolean;
}

export interface WithdrawQuote {
  fee: number;
  estimatedSeconds: number;
  channel: string;
}

export interface DueInstallment {
  loanId: string;
  period: number;
  dueDate: string;
  daysLeft: number;
  principal: number;
  interest: number;
  total: number;
  investorCount: number;
}
