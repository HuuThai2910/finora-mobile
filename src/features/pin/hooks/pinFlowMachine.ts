import { PIN_ERROR, PIN_LENGTH, PIN_MESSAGE } from '../constants';
import { isWeakPin } from '../schemas/pinRules';
import type { PinRequest, PinStatus } from '../types';

/**
 * Máy trạng thái thuần của bảng nhập PIN — không gọi mạng, không đụng React — để
 * `usePinFlow` chỉ còn việc chạy lời gọi API mà máy yêu cầu rồi báo kết quả lại.
 *
 * Mã PIN và mật khẩu của các bước trước nằm trong `step` (bộ nhớ, suốt một lần mở
 * bảng) vì bước cuối phải gửi chúng cùng lúc; đóng bảng là toàn bộ state bị bỏ.
 */
export type PinStep =
  | { name: 'loading' }
  | { name: 'loadFailed' }
  | { name: 'verify' }
  | { name: 'createNew' }
  | { name: 'createConfirm'; newPin: string }
  | { name: 'changeCurrent' }
  | { name: 'changeNew'; currentPin: string }
  | { name: 'changeConfirm'; currentPin: string; newPin: string }
  | { name: 'resetPassword' }
  | { name: 'resetNew'; password: string }
  | { name: 'resetConfirm'; password: string; newPin: string };

export type PinStepName = PinStep['name'];

export type PinFlowState = {
  step: PinStep;
  /** Các số đang nhập ở bước hiện tại; chỉ dùng để vẽ chấm, không bao giờ hiển thị. */
  entry: string;
  busy: boolean;
  /** Lỗi hoặc lời nhắc hiện dưới hàng chấm. */
  message: string | null;
  /** Khóa PIN đang hiệu lực (sai quá số lần): khóa bàn phím ở bước phải nhập PIN hiện tại. */
  lockMessage: string | null;
  /** Tăng mỗi lần nhập sai để giao diện rung hàng chấm. */
  shakeCount: number;
};

/** Lời gọi API mà một bước cần khi người dùng nhập đủ 6 số. */
export type PinCall =
  | { type: 'verify'; pin: string }
  | { type: 'create'; pin: string }
  | { type: 'change'; currentPin: string; newPin: string }
  | { type: 'reset'; password: string; newPin: string };

export type PinAction =
  | { type: 'start' }
  | { type: 'statusLoaded'; status: PinStatus; request: PinRequest; lockMessage: string | null }
  | { type: 'statusFailed'; message: string }
  | { type: 'digit'; digit: string }
  | { type: 'backspace' }
  | { type: 'goTo'; step: PinStep }
  | { type: 'reject'; step: PinStep; message: string; shake: boolean }
  | { type: 'callStarted' }
  | { type: 'locked'; step: PinStep; message: string }
  | { type: 'unlocked' };

export const INITIAL_PIN_FLOW: PinFlowState = {
  step: { name: 'loading' },
  entry: '',
  busy: false,
  message: null,
  lockMessage: null,
  shakeCount: 0,
};

/** Hai bước phải nhập mã PIN đang dùng — chỉ những bước này bị khóa khi PIN bị tạm khóa. */
const LOCKABLE_STEPS: ReadonlySet<PinStepName> = new Set<PinStepName>(['verify', 'changeCurrent']);

/** Bàn phím có nhận số ở trạng thái hiện tại không. */
export function canType(state: PinFlowState): boolean {
  if (state.busy) return false;
  if (state.lockMessage && LOCKABLE_STEPS.has(state.step.name)) return false;
  return state.entry.length < PIN_LENGTH;
}

/** Bước mở đầu theo trạng thái PIN của tài khoản và lý do mở bảng. */
export function initialStep(status: PinStatus, request: PinRequest): PinStep {
  if (!status.hasPin) return { name: 'createNew' };
  return request.kind === 'guard' ? { name: 'verify' } : { name: 'changeCurrent' };
}

/** Bước phải nhập PIN hiện tại — nơi "Quên mã PIN?" quay về khi người dùng bấm lùi. */
function currentPinStep(request: PinRequest): PinStep {
  return request.kind === 'guard' ? { name: 'verify' } : { name: 'changeCurrent' };
}

export type EntryResult =
  | { kind: 'next'; step: PinStep }
  | { kind: 'reject'; step: PinStep; message: string }
  | { kind: 'call'; call: PinCall };

/**
 * Người dùng vừa nhập đủ 6 số ở `step`: sang bước kế (nhập lại để đối chiếu), quay lại
 * vì mã yếu/không khớp, hay đã đủ dữ liệu để gọi API.
 */
export function resolveEntry(step: PinStep, pin: string): EntryResult {
  switch (step.name) {
    case 'verify':
      return { kind: 'call', call: { type: 'verify', pin } };
    case 'createNew':
      return isWeakPin(pin)
        ? { kind: 'reject', step, message: PIN_MESSAGE.weak }
        : { kind: 'next', step: { name: 'createConfirm', newPin: pin } };
    case 'createConfirm':
      return pin === step.newPin
        ? { kind: 'call', call: { type: 'create', pin } }
        : { kind: 'reject', step: { name: 'createNew' }, message: PIN_MESSAGE.mismatch };
    case 'changeCurrent':
      return { kind: 'next', step: { name: 'changeNew', currentPin: pin } };
    case 'changeNew':
      return isWeakPin(pin)
        ? { kind: 'reject', step, message: PIN_MESSAGE.weak }
        : { kind: 'next', step: { name: 'changeConfirm', currentPin: step.currentPin, newPin: pin } };
    case 'changeConfirm':
      return pin === step.newPin
        ? { kind: 'call', call: { type: 'change', currentPin: step.currentPin, newPin: pin } }
        : {
            kind: 'reject',
            step: { name: 'changeNew', currentPin: step.currentPin },
            message: PIN_MESSAGE.mismatch,
          };
    case 'resetNew':
      return isWeakPin(pin)
        ? { kind: 'reject', step, message: PIN_MESSAGE.weak }
        : { kind: 'next', step: { name: 'resetConfirm', password: step.password, newPin: pin } };
    case 'resetConfirm':
      return pin === step.newPin
        ? { kind: 'call', call: { type: 'reset', password: step.password, newPin: pin } }
        : {
            kind: 'reject',
            step: { name: 'resetNew', password: step.password },
            message: PIN_MESSAGE.mismatch,
          };
    default:
      // Các bước còn lại không có bàn phím số nên không thể tới đây; đứng yên tại chỗ.
      return { kind: 'next', step };
  }
}

/**
 * Lời gọi API thất bại: dịch mã lỗi backend sang bước người dùng phải làm lại.
 * `message` là thông điệp tiếng Việt backend trả (hoặc lỗi mạng đã dịch) và được hiển thị
 * nguyên văn — nó đã nói còn bao nhiêu lần thử hay khi nào hết khóa.
 *
 * Lỗi không thuộc nhóm mã PIN (mạng, máy chủ) giữ nguyên bước đang đứng để người dùng nhập
 * lại đúng lần cuối và thử lại, không bắt nhập lại từ đầu.
 */
export function resolveCallError(
  call: PinCall,
  step: PinStep,
  request: PinRequest,
  code: string | null,
  message: string,
): PinAction {
  switch (call.type) {
    case 'verify':
      if (code === PIN_ERROR.locked) return { type: 'locked', step: { name: 'verify' }, message };
      if (code === PIN_ERROR.notSet) {
        return { type: 'reject', step: { name: 'createNew' }, message: PIN_MESSAGE.notSet, shake: false };
      }
      // Lời gọi verify tự động sau khi tạo/đặt lại PIN thất bại cũng rơi về bước nhập PIN thường.
      return { type: 'reject', step: { name: 'verify' }, message, shake: code === PIN_ERROR.incorrect };
    case 'create':
      if (code === PIN_ERROR.tooWeak || code === PIN_ERROR.validation) {
        return { type: 'reject', step: { name: 'createNew' }, message, shake: true };
      }
      if (code === PIN_ERROR.alreadySet) {
        return { type: 'reject', step: currentPinStep(request), message: PIN_MESSAGE.alreadySet, shake: false };
      }
      return { type: 'reject', step, message, shake: false };
    case 'change':
      if (code === PIN_ERROR.locked) return { type: 'locked', step: { name: 'changeCurrent' }, message };
      if (code === PIN_ERROR.incorrect) {
        return { type: 'reject', step: { name: 'changeCurrent' }, message, shake: true };
      }
      if (code === PIN_ERROR.tooWeak || code === PIN_ERROR.validation) {
        return {
          type: 'reject',
          step: { name: 'changeNew', currentPin: call.currentPin },
          message,
          shake: true,
        };
      }
      return { type: 'reject', step, message, shake: false };
    case 'reset':
      if (code === PIN_ERROR.passwordIncorrect) {
        return { type: 'reject', step: { name: 'resetPassword' }, message, shake: false };
      }
      if (code === PIN_ERROR.tooWeak || code === PIN_ERROR.validation) {
        return {
          type: 'reject',
          step: { name: 'resetNew', password: call.password },
          message,
          shake: true,
        };
      }
      return { type: 'reject', step, message, shake: false };
  }
}

/** Bước trước đó khi bấm lùi; `null` nghĩa là bước đầu, chỉ còn cách đóng bảng. */
export function previousStep(step: PinStep, request: PinRequest): PinStep | null {
  switch (step.name) {
    case 'createConfirm':
      return { name: 'createNew' };
    case 'changeNew':
      return { name: 'changeCurrent' };
    case 'changeConfirm':
      return { name: 'changeNew', currentPin: step.currentPin };
    case 'resetPassword':
      return currentPinStep(request);
    case 'resetNew':
      return { name: 'resetPassword' };
    case 'resetConfirm':
      return { name: 'resetNew', password: step.password };
    default:
      return null;
  }
}

export function pinFlowReducer(state: PinFlowState, action: PinAction): PinFlowState {
  switch (action.type) {
    case 'start':
      return INITIAL_PIN_FLOW;
    case 'statusLoaded':
      return {
        ...INITIAL_PIN_FLOW,
        step: initialStep(action.status, action.request),
        lockMessage: action.status.hasPin ? action.lockMessage : null,
      };
    case 'statusFailed':
      return { ...INITIAL_PIN_FLOW, step: { name: 'loadFailed' }, message: action.message };
    case 'digit':
      if (!canType(state) || !/^\d$/.test(action.digit)) return state;
      // Bắt đầu gõ lại là người dùng đã đọc lỗi; xoá để không lẫn với lần nhập mới.
      return { ...state, entry: state.entry + action.digit, message: state.entry ? state.message : null };
    case 'backspace':
      if (state.busy || !state.entry) return state;
      return { ...state, entry: state.entry.slice(0, -1) };
    case 'goTo':
      return { ...state, step: action.step, entry: '', busy: false, message: null };
    case 'reject':
      return {
        ...state,
        step: action.step,
        entry: '',
        busy: false,
        message: action.message || null,
        shakeCount: action.shake ? state.shakeCount + 1 : state.shakeCount,
      };
    case 'callStarted':
      return { ...state, busy: true, message: null };
    case 'locked':
      return {
        ...state,
        step: action.step,
        entry: '',
        busy: false,
        message: null,
        lockMessage: action.message,
        shakeCount: state.shakeCount + 1,
      };
    case 'unlocked':
      return { ...state, lockMessage: null };
  }
}
