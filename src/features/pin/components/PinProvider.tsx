import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PinGuardContext, type PinGuardValue } from '../hooks/usePinGuard';
import type { PinOutcome, PinRequest } from '../types';
import PinSheet from './PinSheet';

type ActiveRequest = { id: number; request: PinRequest };

/**
 * Giữ bảng nhập PIN dùng chung cho toàn app sau đăng nhập và trả kết quả về nơi đã mở
 * qua Promise, để màn gọi viết thẳng `const token = await requirePin('INVEST')`.
 *
 * Mỗi lượt mở có `id` riêng làm `key` của bảng: state của lượt trước (số đã nhập, lỗi)
 * không bao giờ lộ sang lượt sau. Context chỉ chứa hai hàm ổn định, nên mở/đóng bảng
 * không làm render lại các màn đang dùng `usePinGuard`.
 */
export default function PinProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ActiveRequest | null>(null);
  const resolver = useRef<((outcome: PinOutcome) => void) | null>(null);
  const nextId = useRef(1);

  const open = useCallback(
    (request: PinRequest) =>
      new Promise<PinOutcome>(resolve => {
        // Một lần chỉ một bảng: lượt mở chồng lên (bấm hai nút gần nhau) coi như bị huỷ.
        if (resolver.current) {
          resolve({ type: 'cancelled' });
          return;
        }
        resolver.current = resolve;
        setActive({ id: nextId.current++, request });
      }),
    [],
  );

  const finish = useCallback((outcome: PinOutcome) => {
    const resolve = resolver.current;
    resolver.current = null;
    setActive(null);
    resolve?.(outcome);
  }, []);

  // Đăng xuất gỡ provider: lượt đang chờ phải kết thúc là "huỷ" để màn gọi không treo mãi.
  useEffect(
    () => () => {
      resolver.current?.({ type: 'cancelled' });
      resolver.current = null;
    },
    [],
  );

  const value = useMemo<PinGuardValue>(
    () => ({
      requirePin: async scope => {
        const outcome = await open({ kind: 'guard', scope });
        return outcome.type === 'verified' ? outcome.pinToken : null;
      },
      managePin: async () => {
        const outcome = await open({ kind: 'manage' });
        return outcome.type === 'saved' ? outcome.action : null;
      },
    }),
    [open],
  );

  return (
    <PinGuardContext.Provider value={value}>
      {children}
      {active ? <PinSheet key={active.id} request={active.request} onFinish={finish} /> : null}
    </PinGuardContext.Provider>
  );
}
