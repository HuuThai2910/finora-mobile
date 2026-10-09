/**
 * Phạm vi một mã xác nhận PIN được dùng. Khớp enum `scope` của `POST /users/me/pin/verify`
 * ở `finora-user`: token cấp cho phạm vi nào chỉ mở được đúng nhóm API của phạm vi đó.
 */
export type PinScope =
  | 'REPAYMENT'
  | 'INVEST'
  | 'ORDER'
  | 'AUTO_INVEST'
  | 'SIGN_CONTRACT'
  | 'WITHDRAW';

/** `GET /users/me/pin` — cũng là thân trả về của tạo, đổi và đặt lại PIN. */
export type PinStatus = {
  hasPin: boolean;
  locked: boolean;
  /** ISO-8601; chỉ có khi `locked`. */
  lockedUntil: string | null;
  remainingAttempts: number;
};

/** `POST /users/me/pin/verify` — token sống 3 phút, chỉ hợp lệ cho đúng phạm vi và người dùng. */
export type PinVerification = {
  pinToken: string;
  expiresAt: string;
};

/**
 * Lý do mở bảng PIN: chặn trước một thao tác nhạy cảm (cần token để gửi kèm),
 * hoặc người dùng tự vào "Đổi/Tạo mã PIN" ở màn Hồ sơ.
 */
export type PinRequest = { kind: 'guard'; scope: PinScope } | { kind: 'manage' };

/** Việc đã làm xong với mã PIN khi mở từ màn Hồ sơ. */
export type PinSavedAction = 'created' | 'changed' | 'reset';

/** Kết quả một lần mở bảng PIN, trả về cho nơi đã mở. */
export type PinOutcome =
  | { type: 'verified'; pinToken: string }
  | { type: 'saved'; action: PinSavedAction }
  | { type: 'cancelled' };
