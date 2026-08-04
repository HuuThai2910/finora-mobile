import type { PositionStatus } from '@/types/invest';
import type { TagTone } from '@/components/ui';

export const POSITION_TONE: Record<PositionStatus, TagTone> = {
  ACTIVE: 'green',
  WATCHLIST: 'amber',
  FUNDED: 'blue',
  CLOSED: 'gray',
};

export const AUTO_INVEST_ON_NOTE = '● Đang bật — tự khớp lệnh khi hồ sơ mới lên sàn';
export const AUTO_INVEST_OFF_NOTE = '○ Đang tắt — bạn tự chọn từng khoản trên sàn';

/** Hai phương thức ký số VNPT SmartCA trong mockup. */
export const SIGNATURE_METHODS = [
  { value: 'PASSWORD_OTP' as const, label: 'Mật khẩu + OTP' },
  { value: 'APP_CONFIRM' as const, label: 'Xác nhận trên App' },
];

export const TRANSFER_LEGAL_NOTE =
  'Sau khi 2 bên ký số SmartCA: ghi NOTE_TRANSFER lên sổ cái · thông báo người vay theo Điều 365 BLDS · dòng tiền từ kỳ sau chuyển về bạn.';
