export type KycStatus = 'NOT_STARTED' | 'PENDING_REVIEW' | 'KYC_VERIFIED' | 'REJECTED';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  /** Chữ cái đầu dùng cho ảnh đại diện chữ. */
  initial: string;
  kycStatus: KycStatus;
  creditGrade: 'A' | 'B' | 'C' | 'D';
  creditScore: number;
  linkedBank: { bank: string; maskedNumber: string; holder: string; verified: boolean } | null;
}

export interface Session {
  accessToken: string;
  profile: UserProfile;
}

export interface OtpChallenge {
  /** Số điện thoại đã che bớt để hiển thị. */
  maskedPhone: string;
  /** Số chữ số của mã. */
  length: number;
  expiresInSeconds: number;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}
