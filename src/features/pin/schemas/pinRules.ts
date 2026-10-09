import { PIN_LENGTH } from '../constants';

/**
 * Bắt sớm những mã PIN backend chắc chắn từ chối (`PIN_TOO_WEAK`): sáu số giống nhau
 * và dãy tăng/giảm đều từng đơn vị như 123456, 987654. Chỉ để người dùng khỏi phải
 * nhập lại lần hai rồi mới biết bị từ chối; backend vẫn là nơi quyết định cuối cùng.
 */
export function isWeakPin(pin: string): boolean {
  if (!isCompletePin(pin)) return false;

  const digits = pin.split('').map(Number);
  const steps = digits.slice(1).map((digit, i) => digit - digits[i]);
  const step = steps[0];

  return (step === 0 || step === 1 || step === -1) && steps.every(s => s === step);
}

/** Đủ 6 ký tự và chỉ gồm chữ số. */
export function isCompletePin(pin: string): boolean {
  return pin.length === PIN_LENGTH && /^\d+$/.test(pin);
}
