import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getRepayment } from '../api/servicingApi';
import type { RepaymentResult } from '../types';

const TERMINAL: ReadonlySet<RepaymentResult['status']> = new Set([
  'COMPLETED', 'FAILED', 'RECONCILIATION_REQUIRED',
]);

/**
 * Theo dõi lệnh thu nợ bất đồng bộ trong tối đa 60 giây. Polling dừng khi có
 * terminal state, khi rời screen hoặc app xuống background để không đánh thức
 * mạng/pin vô ích; quay foreground sẽ tiếp tục với số lần còn lại.
 */
export function useRepaymentTracking(initial: RepaymentResult | null) {
  const [data, setData] = useState<RepaymentResult | null>(initial);

  useEffect(() => {
    setData(initial);
    if (!initial || TERMINAL.has(initial.status)) return undefined;

    let alive = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;

    const schedule = () => {
      if (!alive || attempts >= 30 || AppState.currentState !== 'active') return;
      timer = setTimeout(run, 2_000);
    };
    const run = async () => {
      if (!alive || AppState.currentState !== 'active') return;
      attempts += 1;
      controller = new AbortController();
      try {
        const next = await getRepayment(initial.repaymentId, controller.signal);
        if (!alive) return;
        setData(next);
        if (!TERMINAL.has(next.status)) schedule();
      } catch {
        // Lỗi mạng tạm thời không làm mất response đã thu tiền; thử lại có giới hạn.
        schedule();
      }
    };
    const subscription = AppState.addEventListener('change', state => {
      if (timer) clearTimeout(timer);
      controller?.abort();
      if (state === 'active') schedule();
    });
    schedule();

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      controller?.abort();
      subscription.remove();
    };
  }, [initial]);

  return data;
}

