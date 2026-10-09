import type { PinScope } from '../types';

/** Backend chỉ nhận đúng 6 chữ số. */
export const PIN_LENGTH = 6;

/** Header mang token xác nhận PIN tới API được bảo vệ. */
export const PIN_TOKEN_HEADER = 'X-Pin-Token';

/** Tên thao tác hiện dưới tiêu đề bảng nhập PIN, để người dùng biết mình đang xác nhận việc gì. */
export const PIN_SCOPE_LABEL: Record<PinScope, string> = {
  REPAYMENT: 'Xác nhận thanh toán khoản vay',
  INVEST: 'Xác nhận đặt lệnh đầu tư',
  ORDER: 'Xác nhận đặt lệnh mua/bán Note',
  AUTO_INVEST: 'Xác nhận lưu cài đặt Auto-Invest',
  SIGN_CONTRACT: 'Xác nhận ký hợp đồng',
  WITHDRAW: 'Xác nhận rút tiền',
};

/** Mã lỗi `finora-user` trả cho các API mã PIN. */
export const PIN_ERROR = {
  incorrect: 'PIN_INCORRECT',
  locked: 'PIN_LOCKED',
  notSet: 'PIN_NOT_SET',
  alreadySet: 'PIN_ALREADY_SET',
  tooWeak: 'PIN_TOO_WEAK',
  validation: 'VALIDATION_FAILED',
  passwordIncorrect: 'PASSWORD_INCORRECT',
} as const;

export const PIN_MESSAGE = {
  mismatch: 'Mã PIN nhập lại không khớp. Vui lòng tạo lại.',
  weak: 'Mã PIN quá dễ đoán. Tránh các số giống nhau hoặc dãy liên tiếp như 123456.',
  notSet: 'Bạn chưa có mã PIN. Hãy tạo mã PIN để tiếp tục.',
  alreadySet: 'Tài khoản đã có mã PIN. Vui lòng nhập mã PIN hiện tại.',
  passwordRequired: 'Nhập mật khẩu đăng nhập để tiếp tục.',
} as const;
