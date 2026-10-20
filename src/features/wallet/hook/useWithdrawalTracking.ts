import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { ApiError, toUserMessage } from '@/lib/api';
import type { Withdrawal } from '@/types/wallet';
import { getWithdrawal } from '../api';
import { WITHDRAWAL_POLL_INTERVAL_MS, WITHDRAWAL_POLL_WINDOW_MS } from '../constant';
import { isFinalWithdrawal } from '../mappers/withdrawal';

export type WithdrawalTracking = {
  withdrawal: Withdrawal | null;
  /** Lần tải đầu chưa có kết quả. */
  loading: boolean;
  /** Lỗi của lần hỏi gần nhất; lệnh đã tải trước đó vẫn được giữ trên màn. */
  error: string | null;
  /** Còn tự hỏi lại theo chu kỳ (lệnh chưa có kết quả cuối và còn trong khung theo dõi). */
  watching: boolean;
  /** Đang chạy lần hỏi do người dùng bấm "Kiểm tra lại". */
  checking: boolean;
  /** Hỏi lại ngay và mở một khung theo dõi mới. */
  refresh: () => void;
};

/**
 * Theo dõi một lệnh rút tới khi có kết quả cuối (`COMPLETED`/`FAILED`) bằng `GET /wallets/me/withdrawals/{id}`.
 *
 * - Hỏi lại mỗi `WITHDRAWAL_POLL_INTERVAL_MS`, chỉ trong `WITHDRAWAL_POLL_WINDOW_MS` kể từ lúc bắt đầu theo dõi: provider
 *   giả lập trả kết quả sau vài giây, còn lệnh rơi vào đối soát có thể mất lâu hơn nhiều — quá khung thì dừng và chờ
 *   người dùng bấm kiểm tra lại, không hỏi vô hạn.
 * - Chỉ chạy khi `active` (màn đang hiển thị) và app ở tiền cảnh; app về nền thì thôi hẹn lượt mới, quay lại thì hỏi
 *   ngay một lần rồi chạy tiếp nếu còn trong khung. Rời màn thì huỷ lượt đang chờ và request đang bay.
 * - Mỗi lúc chỉ một request; lỗi mạng hay 5xx không dừng việc theo dõi (lượt sau hỏi lại), còn lỗi 4xx (không tìm
 *   thấy lệnh, hết phiên) thì dừng vì hỏi lại y nguyên cũng vô ích.
 */
export function useWithdrawalTracking(withdrawalId: string, active: boolean): WithdrawalTracking {
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [checking, setChecking] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    // Đã có kết quả cuối, gặp lỗi 4xx hoặc hết khung: không hỏi tiếp, kể cả khi app quay lại tiền cảnh.
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inFlight: AbortController | null = null;
    // `inactive` của iOS chỉ là lúc chuyển cảnh (kéo trung tâm điều khiển); chỉ `background` mới là rời app.
    let foreground = AppState.currentState !== 'background';
    const deadline = Date.now() + WITHDRAWAL_POLL_WINDOW_MS;

    const poll = async () => {
      if (inFlight) return;
      const controller = new AbortController();
      inFlight = controller;
      let keepWatching = true;
      try {
        const next = await getWithdrawal(withdrawalId, controller.signal);
        if (!alive) return;
        setWithdrawal(next);
        setError(null);
        keepWatching = !isFinalWithdrawal(next.status);
      } catch (e) {
        if (!alive) return;
        setError(toUserMessage(e));
        keepWatching = !(e instanceof ApiError && e.isBusinessError);
      } finally {
        inFlight = null;
        if (alive) {
          setLoading(false);
          setChecking(false);
        }
      }
      if (!keepWatching || Date.now() >= deadline) {
        stopped = true;
        setWatching(false);
        return;
      }
      if (foreground) timer = setTimeout(() => void poll(), WITHDRAWAL_POLL_INTERVAL_MS);
    };

    const subscription = AppState.addEventListener('change', state => {
      const next = state !== 'background';
      if (next === foreground) return;
      foreground = next;
      if (timer) clearTimeout(timer);
      timer = undefined;
      if (next && !stopped) void poll();
    });

    setWatching(true);
    void poll();

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      inFlight?.abort();
      subscription.remove();
    };
  }, [withdrawalId, active, round]);

  const refresh = useCallback(() => {
    setChecking(true);
    setRound(value => value + 1);
  }, []);

  return { withdrawal, loading, error, watching, checking, refresh };
}
