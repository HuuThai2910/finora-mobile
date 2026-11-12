import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { toUserMessage } from '@/lib/api';
import type { BookSnapshot } from '@/types/orderBook';
import { getOrderBook, isStreamAvailable, orderBookSocketUrl, parseStreamMessage } from '../api';
import { POLL_INTERVAL_MS, STREAM_RETRY_MS } from '../constant';

/** Mã đóng riêng của Investment: sổ không tồn tại (không mở lại) và phiên hết thời hạn (xin vé mới, mở lại ngay). */
const CLOSE_LISTING_NOT_FOUND = 4404;
const CLOSE_SESSION_EXPIRED = 4000;

/** `live`: đang nhận đẩy qua WebSocket. `polling`: kênh không mở được, đang hỏi lại định kỳ. */
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
 * Tải ảnh chụp qua REST trước để màn có dữ liệu ngay, rồi mở WebSocket (xin vé dùng một lần qua REST
 * rồi bắt tay) nhận ảnh mới mỗi khi có lệnh đặt, khớp hoặc huỷ. Kênh đứt (mạng, chưa cấu hình địa
 * chỉ WebSocket, bản mock) thì chuyển sang hỏi lại mỗi 5 giây và thử mở lại sau 15 giây bằng vé mới
 * — người dùng luôn thấy sổ mới, chỉ khác độ trễ. Server tự ping giữ kết nối; WebSocket của React
 * Native tự trả pong.
 *
 * Chỉ chạy khi màn đang hiện và app ở foreground: rời màn (mở form đặt lệnh) hay đưa app xuống nền
 * thì đóng kênh và dừng hỏi, quay lại thì tải lại ngay. Ảnh đến muộn có `sequence` nhỏ hơn ảnh
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

  // Theo dõi app lên/xuống nền để dừng kênh và hẹn giờ khi không ai nhìn.
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
    let socket: WebSocket | null = null;
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

    const retryLater = (delayMs = STREAM_RETRY_MS) => {
      startPolling();
      retryTimer = setTimeout(() => void openStream(), delayMs);
    };

    const openStream = async () => {
      if (!alive) return;
      let url: string;
      try {
        url = await orderBookSocketUrl(listingId);
      } catch {
        // Không xin được vé (mạng, phiên hết hạn): hỏi định kỳ rồi thử lại.
        if (alive) retryLater();
        return;
      }
      if (!alive) return;
      const ws = new WebSocket(url);
      socket = ws;
      ws.onopen = () => {
        if (!alive || socket !== ws) return;
        stopPolling();
        setConnection('live');
      };
      ws.onmessage = event => {
        if (!alive) return;
        try {
          const snapshot = parseStreamMessage(String(event.data));
          if (snapshot) accept(snapshot);
        } catch {
          // Gói hỏng không làm mất sổ đang hiện; ảnh kế tiếp hoặc lượt hỏi lại sẽ bù.
        }
      };
      // Lỗi đường truyền luôn kèm `close` ngay sau, nên chỉ xử lý mở lại ở đây.
      ws.onclose = event => {
        if (!alive || socket !== ws) return;
        socket = null;
        if (event.code === CLOSE_LISTING_NOT_FOUND) {
          startPolling();
          return;
        }
        retryLater(event.code === CLOSE_SESSION_EXPIRED ? 0 : STREAM_RETRY_MS);
      };
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
      socket?.close(1000);
      socket = null;
      stopPolling();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [listingId, focused, foreground, tick, accept]);

  const reload = useCallback(() => setTick(t => t + 1), []);

  return { data, loading: loading && !data, error, connection, reload };
}
