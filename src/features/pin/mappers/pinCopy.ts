import { formatDateTime } from '@/utils/format';
import { PIN_SCOPE_LABEL } from '../constants';
import type { PinStep } from '../hooks/pinFlowMachine';
import type { PinRequest } from '../types';

export type PinStepCopy = { title: string; subtitle: string };

/** Tiêu đề và dòng phụ của bảng PIN theo bước; dòng phụ của bước nhập PIN nói rõ đang xác nhận việc gì. */
export function pinStepCopy(step: PinStep, request: PinRequest): PinStepCopy {
  switch (step.name) {
    case 'loading':
      return { title: 'Mã PIN', subtitle: 'Đang kiểm tra mã PIN của bạn…' };
    case 'loadFailed':
      return { title: 'Mã PIN', subtitle: 'Chưa kiểm tra được mã PIN.' };
    case 'verify':
      return {
        title: 'Nhập mã PIN',
        subtitle: request.kind === 'guard' ? PIN_SCOPE_LABEL[request.scope] : 'Xác nhận giao dịch',
      };
    case 'createNew':
      return {
        title: 'Tạo mã PIN',
        subtitle:
          request.kind === 'guard'
            ? 'Giao dịch này cần mã PIN 6 số. Tạo mã ngay để tiếp tục.'
            : 'Mã PIN gồm 6 chữ số, dùng để xác nhận các giao dịch.',
      };
    case 'createConfirm':
      return { title: 'Nhập lại mã PIN', subtitle: 'Nhập lại 6 số vừa tạo để xác nhận.' };
    case 'changeCurrent':
      return { title: 'Nhập mã PIN hiện tại', subtitle: 'Xác minh trước khi đổi mã PIN.' };
    case 'changeNew':
      return { title: 'Nhập mã PIN mới', subtitle: 'Tránh các số giống nhau hoặc dãy liên tiếp.' };
    case 'changeConfirm':
      return { title: 'Nhập lại mã PIN mới', subtitle: 'Nhập lại 6 số vừa chọn để xác nhận.' };
    case 'resetPassword':
      return { title: 'Quên mã PIN', subtitle: 'Nhập mật khẩu đăng nhập để đặt lại mã PIN.' };
    case 'resetNew':
      return { title: 'Đặt mã PIN mới', subtitle: 'Tránh các số giống nhau hoặc dãy liên tiếp.' };
    case 'resetConfirm':
      return { title: 'Nhập lại mã PIN mới', subtitle: 'Nhập lại 6 số vừa chọn để xác nhận.' };
  }
}

/** Lời báo khóa dựng từ `GET /users/me/pin` khi mở bảng lúc PIN đang bị khóa sẵn. */
export function pinLockedMessage(lockedUntil: string | null): string {
  const until = lockedUntil ? ` đến ${formatDateTime(lockedUntil)}` : '';
  return `Mã PIN đang tạm khóa${until} do nhập sai nhiều lần. Bạn có thể đặt lại bằng "Quên mã PIN?".`;
}
