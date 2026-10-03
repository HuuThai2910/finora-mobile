import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { toUserMessage } from '@/lib/api';
import { openEventStream, type StreamHandle } from '@/lib/sse';
import type { BookSnapshot } from '@/types/orderBook';
import {
  getOrderBook,
  isStreamAvailable,
  orderBookStreamRequest,
  parseStreamSnapshot,
} from '../api';
import { POLL_INTERVAL_MS, STREAM_RETRY_MS } from '../constant';

/** `live`: đang nhận đẩy qua SSE. `polling`: luồng không mở được, đang hỏi lại định kỳ. */
export type BookConnection = 'connecting' | 'live' | 'polling' | 'paused';

export type LiveOrderBook = {
  data: BookSnapshot | null;
  loading: boolean;
  error: string | null;
  connection: BookConnection;
  reload: () => void;
};

/**
 * Sổ lệnh của một khoản vay, tự cập nhật.
 *
 * Tải ảnh chụp qua REST trước để màn có dữ liệu ngay, rồi mở luồng SSE nhận ảnh mới mỗi khi có
 * lệnh đặt, khớp hoặc huỷ. Luồng đứt (mạng, Gateway đệm, bản mock) thì chuyển sang hỏi lại mỗi 5
 * giây và thử mở luồng lại sau 15 giây — người dùng luôn thấy sổ mới, chỉ khác độ trễ.
 *
 * Chỉ chạy khi màn đang hiện và app ở foreground: rời màn (mở form đặt lệnh) hay đưa app xuống nền
 * thì đóng luồng và dừng hỏi, quay lại thì tải lại ngay. Ảnh đến muộn có `sequence` nhỏ hơn ảnh
 * đang giữ thì bỏ, vì backend có thể đẩy hai ảnh gần nhau không đúng thứ tự.
 */
export function useLiveOrderBook(listingId: number): LiveOrderBook {
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [data, setData] = useState<BookSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<BookConnection>('connecting');
  const [tick, setTick] = useState(0);
  const sequence = useRef(-1);

  const accept = useCallback((snapshot: BookSnapshot) => {
    if (snapshot.sequence < sequence.current) return;
    sequence.current = snapshot.sequence;
    setData(snapshot);
    setError(null);
  }, []);

  // Theo dõi app lên/xuống nền để dừng luồng và hẹn giờ khi không ai nhìn.
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const active = focused && foreground;
    if (!active) {
      setConnection('paused');
      return;
    }

    let alive = true;
    let stream: StreamHandle | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    const controller = new AbortController();

    const fetchOnce = () =>
      getOrderBook(listingId, controller.signal)
        .then(snapshot => alive && accept(snapshot))
        .catch((e: unknown) => {
          if (alive) setError(toUserMessage(e));
        });

    const startPolling = () => {
      setConnection('polling');
      if (!pollTimer) pollTimer = setInterval(fetchOnce, POLL_INTERVAL_MS);
    };
    const stopPolling = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    };

    const openStream = async () => {
      if (!alive) return;
      const { url, headers } = await orderBookStreamRequest(listingId);
      if (!alive) return;
      stream = openEventStream({
        url,
        headers,
        onOpen: () => {
          if (!alive) return;
          stopPolling();
          setConnection('live');
        },
        onEvent: event => {
          if (event.event !== 'snapshot') return;
          try {
            accept(parseStreamSnapshot(event.data));
          } catch {
            // Gói hỏng không làm mất sổ đang hiện; ảnh kế tiếp hoặc lượt hỏi lại sẽ bù.
            setConnection('polling');
          }
        },
        onClose: () => {
          if (!alive) return;
          stream = null;
          startPolling();
          retryTimer = setTimeout(() => void openStream(), STREAM_RETRY_MS);
        },
      });
    };

    setLoading(true);
    fetchOnce().finally(() => alive && setLoading(false));
    if (isStreamAvailable()) {
      setConnection('connecting');
      void openStream();
    } else {
      startPolling();
    }

    return () => {
      alive = false;
      controller.abort();
      stream?.close();
      stopPolling();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [listingId, focused, foreground, tick, accept]);

  const reload = useCallback(() => setTick(t => t + 1), []);

  return { data, loading: loading && !data, error, connection, reload };
}
