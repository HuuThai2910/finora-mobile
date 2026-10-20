import { useCallback, useEffect, useRef, useState } from 'react';
import { toUserMessage } from '@/lib/api';
import type { Withdrawal } from '@/types/wallet';
import { getWithdrawals } from '../api';
import { WITHDRAWAL_PAGE_SIZE } from '../constant';

type Loaded = { items: Withdrawal[]; page: number; last: boolean };

export type WithdrawalHistory = {
  items: Withdrawal[];
  /** Lần tải đầu, chưa có gì để hiện. */
  loading: boolean;
  /** Đang tải lại trang đầu trong khi danh sách cũ vẫn hiện (kéo làm mới, quay lại màn). */
  refreshing: boolean;
  /** Lỗi tải trang đầu; nếu đã có danh sách cũ thì danh sách vẫn được giữ. */
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  loadMoreError: string | null;
  refresh: () => void;
  loadMore: () => void;
};

/**
 * Lịch sử lệnh rút của người dùng, mỗi lần một trang `WITHDRAWAL_PAGE_SIZE` lệnh, mới nhất trước.
 *
 * "Xem thêm" nối trang kế vào cuối; làm mới thì tải lại từ trang đầu và huỷ lượt "xem thêm" đang chạy để hai kết quả
 * không ghi đè nhau. Lệnh mới phát sinh giữa hai lần tải đẩy các trang lùi lại, nên khi nối trang bỏ các lệnh đã có
 * (theo `withdrawalId`) thay vì hiện hai lần.
 */
export function useWithdrawalHistory(): WithdrawalHistory {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const more = useRef<AbortController | null>(null);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    more.current?.abort();
    more.current = null;
    setLoadingMore(false);
    setLoadMoreError(null);
    setLoading(true);
    setError(null);
    getWithdrawals(0, WITHDRAWAL_PAGE_SIZE, controller.signal)
      .then(result => {
        if (alive) setLoaded({ items: result.content, page: result.page, last: result.last });
      })
      .catch((e: unknown) => {
        if (alive) setError(toUserMessage(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
      controller.abort();
    };
  }, [tick]);

  // Rời màn thì huỷ lượt "xem thêm" còn đang chạy.
  useEffect(() => () => more.current?.abort(), []);

  const loadMore = () => {
    if (!loaded || loaded.last || loading || more.current) return;
    const controller = new AbortController();
    more.current = controller;
    setLoadingMore(true);
    setLoadMoreError(null);
    getWithdrawals(loaded.page + 1, WITHDRAWAL_PAGE_SIZE, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        setLoaded(prev => {
          if (!prev) return prev;
          const known = new Set(prev.items.map(item => item.withdrawalId));
          const fresh = result.content.filter(item => !known.has(item.withdrawalId));
          return { items: [...prev.items, ...fresh], page: result.page, last: result.last };
        });
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setLoadMoreError(toUserMessage(e));
      })
      .finally(() => {
        if (more.current !== controller) return;
        more.current = null;
        setLoadingMore(false);
      });
  };

  // Ổn định qua các lần render để màn dùng được trong `useFocusEffect`.
  const refresh = useCallback(() => setTick(value => value + 1), []);

  return {
    items: loaded?.items ?? [],
    loading: loading && !loaded,
    refreshing: loading && !!loaded,
    error,
    hasMore: !!loaded && !loaded.last,
    loadingMore,
    loadMoreError,
    refresh,
    loadMore,
  };
}
