import { OTP_LENGTH, PASSWORD_MIN_LENGTH } from '../constants';

/**
 * Kiểm tra dữ liệu ngay trên máy để người dùng biết lỗi trước khi gửi đi.
 * Đây chỉ là lớp trải nghiệm — `finora-user` vẫn kiểm tra lại bằng Bean Validation
 * và là bên quyết định cuối cùng.
 */

export type FieldErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VN_PHONE_PATTERN = /^0\d{9}$/;

export const isValid = (errors: FieldErrors): boolean => Object.keys(errors).length === 0;

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/** Bỏ khoảng trắng người dùng gõ để dễ đọc, ví dụ "0912 345 678". */
export const normalizePhone = (phone: string): string => phone.replace(/\s/g, '');

function checkEmail(email: string, errors: FieldErrors): void {
  if (!email.trim()) errors.email = 'Nhập email đăng nhập.';
  else if (!EMAIL_PATTERN.test(normalizeEmail(email))) errors.email = 'Email chưa đúng định dạng.';
}

function checkPassword(password: string, errors: FieldErrors, field = 'password'): void {
  if (!password) errors[field] = 'Nhập mật khẩu.';
  else if (password.length < PASSWORD_MIN_LENGTH) {
    errors[field] = `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự.`;
  }
}

function checkConfirmPassword(confirm: string, password: string, errors: FieldErrors): void {
  if (!confirm) errors.confirmPassword = 'Nhập lại mật khẩu để xác nhận.';
  else if (confirm !== password) {
    errors.confirmPassword = 'Hai lần nhập mật khẩu chưa khớp.';
  }
}

export function validateLogin(values: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  checkEmail(values.email, errors);
  if (!values.password) errors.password = 'Nhập mật khẩu.';
  return errors;
}

export function validateRegister(values: {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}): FieldErrors {
  const errors: FieldErrors = {};

  checkEmail(values.email, errors);

  if (!VN_PHONE_PATTERN.test(normalizePhone(values.phone))) {
    errors.phone = 'Số điện thoại gồm 10 chữ số và bắt đầu bằng 0.';
  }

  checkPassword(values.password, errors);
  checkConfirmPassword(values.confirmPassword, values.password, errors);

  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Cần đồng ý điều khoản trước khi tạo tài khoản.';
  }

  return errors;
}

export function validateForgotPassword(values: { email: string }): FieldErrors {
  const errors: FieldErrors = {};
  checkEmail(values.email, errors);
  return errors;
}

export function validateResetOtp(values: { otp: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (values.otp.length !== OTP_LENGTH) errors.otp = `Mã gồm ${OTP_LENGTH} chữ số.`;
  return errors;
}

export function validateResetPassword(values: {
  newPassword: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  checkPassword(values.newPassword, errors, 'newPassword');
  checkConfirmPassword(values.confirmPassword, values.newPassword, errors);

  return errors;
}
