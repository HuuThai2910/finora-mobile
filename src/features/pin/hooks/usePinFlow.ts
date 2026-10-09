import { useCallback, useEffect, useReducer, useRef } from 'react';
import { ApiError, toUserMessage } from '@/lib/api';
import { changePin, createPin, getPinStatus, resetPin, verifyPin } from '../api/pinApi';
import { PIN_LENGTH, PIN_MESSAGE } from '../constants';
import { pinLockedMessage } from '../mappers/pinCopy';
import type { PinOutcome, PinRequest, PinScope } from '../types';
import {
  INITIAL_PIN_FLOW,
  pinFlowReducer,
  previousStep,
  resolveCallError,
  resolveEntry,
  type PinCall,
  type PinFlowState,
  type PinStep,
} from './pinFlowMachine';

export type PinFlow = {
  state: PinFlowState;
  pressDigit: (digit: string) => void;
  backspace: () => void;
  /** Có bước trước để lùi về không (bước nhập lại, các bước "Quên mã PIN?"). */
  canGoBack: boolean;
  back: () => void;
  forgot: () => void;
  submitPassword: (password: string) => void;
  retryLoad: () => void;
  /** Đóng bảng mà không làm gì; bị chặn khi đang chờ máy chủ để không bỏ dở một lần đổi PIN. */
  cancel: () => void;
};

const codeOf = (error: unknown): string | null => (error instanceof ApiError ? error.code : null);

/**
 * Điều phối một lần mở bảng PIN: tải trạng thái PIN, nhận từng số từ bàn phím, đủ 6 số thì
 * hỏi `pinFlowMachine` bước tiếp theo và gọi API khi cần.
 *
 * - Chưa có PIN: tạo (nhập hai lần) → `POST /users/me/pin`; nếu đang chặn một thao tác thì
 *   xác nhận luôn bằng mã vừa tạo để lấy token, người dùng không phải nhập lần thứ ba.
 * - "Quên mã PIN?": mật khẩu + PIN mới hai lần → `POST /users/me/pin/reset`, rồi cũng tự xác nhận.
 * - Kết quả trả qua `onFinish` đúng một lần. Token chỉ đi thẳng về nơi gọi, không lưu ở đây.
 *
 * Hook sống cùng một lần mở bảng (component cha gắn `key` theo lượt mở), nên state luôn bắt
 * đầu sạch và mọi request đang chạy bị huỷ khi bảng đóng.
 */
export function usePinFlow(request: PinRequest, onFinish: (outcome: PinOutcome) => void): PinFlow {
  const [state, dispatch] = useReducer(pinFlowReducer, INITIAL_PIN_FLOW);
  const alive = useRef(true);
  const loadController = useRef<AbortController | null>(null);

  const finish = useCallback(
    (outcome: PinOutcome) => {
      if (alive.current) onFinish(outcome);
    },
    [onFinish],
  );

  const loadStatus = useCallback(() => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    dispatch({ type: 'start' });

    getPinStatus(controller.signal)
      .then(status => {
        if (controller.signal.aborted) return;
        const lockMessage = status.locked ? pinLockedMessage(status.lockedUntil) : null;
        dispatch({ type: 'statusLoaded', status, request, lockMessage });
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) dispatch({ type: 'statusFailed', message: toUserMessage(e) });
      });
  }, [request]);

  // Tải trạng thái PIN ngay khi mở bảng; đóng bảng (unmount) thì huỷ request còn treo và
  // chặn mọi kết quả về muộn — kể cả lời gọi verify/đổi PIN đang chạy.
  useEffect(() => {
    alive.current = true;
    loadStatus();
    return () => {
      alive.current = false;
      loadController.current?.abort();
    };
  }, [loadStatus]);

  /** Xác nhận PIN lấy token; lỗi thì quay về bước nhập PIN theo mã lỗi backend. */
  const verify = useCallback(
    async (pin: string, scope: PinScope) => {
      try {
        const { pinToken } = await verifyPin(pin, scope);
        finish({ type: 'verified', pinToken });
      } catch (e) {
        if (!alive.current) return;
        const call: PinCall = { type: 'verify', pin };
        dispatch(resolveCallError(call, { name: 'verify' }, request, codeOf(e), toUserMessage(e)));
      }
    },
    [finish, request],
  );

  const run = useCallback(
    async (call: PinCall, step: PinStep) => {
      dispatch({ type: 'callStarted' });
      try {
        switch (call.type) {
          case 'verify':
            if (request.kind === 'guard') await verify(call.pin, request.scope);
            return;
          case 'change':
            await changePin(call.currentPin, call.newPin);
            finish({ type: 'saved', action: 'changed' });
            return;
          case 'create':
            await createPin(call.pin);
            break;
          case 'reset':
            await resetPin(call.password, call.newPin);
            // Đặt lại thành công thì backend đã gỡ khóa; bàn phím bước nhập PIN mở lại.
            if (alive.current) dispatch({ type: 'unlocked' });
            break;
        }
      } catch (e) {
        if (alive.current) dispatch(resolveCallError(call, step, request, codeOf(e), toUserMessage(e)));
        return;
      }

      // Tới đây là vừa tạo hoặc đặt lại PIN xong.
      const newPin = call.type === 'create' ? call.pin : call.newPin;
      if (request.kind === 'guard') {
        await verify(newPin, request.scope);
      } else {
        finish({ type: 'saved', action: call.type === 'create' ? 'created' : 'reset' });
      }
    },
    [finish, request, verify],
  );

  // Nhập đủ 6 số là tự gửi như MoMo, không cần nút xác nhận. Chạy trong effect (không phải
  // trong handler bấm phím) để hai lần chạm sát nhau vẫn chỉ gửi đúng một lần.
  useEffect(() => {
    if (state.busy || state.entry.length !== PIN_LENGTH) return;
    const result = resolveEntry(state.step, state.entry);
    if (result.kind === 'next') dispatch({ type: 'goTo', step: result.step });
    else if (result.kind === 'reject') {
      dispatch({ type: 'reject', step: result.step, message: result.message, shake: true });
    } else void run(result.call, state.step);
  }, [run, state.busy, state.entry, state.step]);

  const prev = previousStep(state.step, request);

  return {
    state,
    pressDigit: digit => dispatch({ type: 'digit', digit }),
    backspace: () => dispatch({ type: 'backspace' }),
    canGoBack: prev !== null && !state.busy,
    back: () => {
      if (prev && !state.busy) dispatch({ type: 'goTo', step: prev });
    },
    forgot: () => {
      if (!state.busy) dispatch({ type: 'goTo', step: { name: 'resetPassword' } });
    },
    submitPassword: password => {
      if (!password) {
        dispatch({ type: 'reject', step: state.step, message: PIN_MESSAGE.passwordRequired, shake: false });
        return;
      }
      dispatch({ type: 'goTo', step: { name: 'resetNew', password } });
    },
    retryLoad: loadStatus,
    cancel: () => {
      if (!state.busy) finish({ type: 'cancelled' });
    },
  };
}
