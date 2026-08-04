import type { KycStatus } from '@/types/auth';
import type { TagTone } from '@/components/ui';

export const KYC_TONE: Record<KycStatus, TagTone> = {
  NOT_STARTED: 'gray',
  PENDING_REVIEW: 'amber',
  KYC_VERIFIED: 'green',
  REJECTED: 'red',
};

export const KYC_LABEL: Record<KycStatus, string> = {
  NOT_STARTED: 'CHƯA ĐỊNH DANH',
  PENDING_REVIEW: 'CHỜ DUYỆT TAY',
  KYC_VERIFIED: 'KYC_VERIFIED',
  REJECTED: 'BỊ TỪ CHỐI',
};

export const LOGOUT_CONFIRM_TITLE = 'Đăng xuất?';
export const LOGOUT_CONFIRM_BODY = 'Bạn sẽ cần đăng nhập lại ở lần mở ứng dụng sau.';
