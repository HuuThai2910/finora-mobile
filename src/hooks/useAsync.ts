import { useCallback, useEffect, useState } from 'react';
import { toUserMessage } from '@/lib/api';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  /** Thông điệp đã dịch sang ngôn ngữ người dùng, rỗng nếu không lỗi. */
  error: string | null;
  reload: () => void;
};

/**
 * Bọc một lời gọi dữ liệu thành ba trạng thái tải / lỗi / có dữ liệu.
 * Mọi hook trong `features/<x>/hook/` xây trên hàm này để loading và lỗi chỉ
 * được xử lý ở một chỗ duy nhất.
 *
 * Lỗi không bị nuốt: nó được giữ lại và trả về cho màn hình hiển thị.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: readonly unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    run()
      .then(result => {
        if (alive) setData(result);
      })
      .catch((e: unknown) => {
        if (alive) setError(toUserMessage(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [run, tick]);

  return { data, loading, error, reload: () => setTick(t => t + 1) };
}
