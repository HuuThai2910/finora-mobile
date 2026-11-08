import { useEffect, useRef } from 'react';

/** Trạng thái đích của mốc mới nhất trong lịch sử (backend trả mới nhất trước, nhưng không dựa vào thứ tự đó). */
export function latestStatus<T extends { toStatus: string }>(
  history: readonly T[],
  timeOf: (item: T) => string,
): string | undefined {
  let latest: T | undefined;
  for (const item of history) {
    if (!latest || timeOf(item) > timeOf(latest)) latest = item;
  }
  return latest?.toStatus;
}

/**
 * Hồ sơ/hợp đồng và lịch sử của nó là hai lời gọi riêng nên có thể về lệch nhau: thẻ trạng thái đã
 * "Đã duyệt" mà dòng thời gian vẫn dừng ở "Chờ duyệt". Thấy mốc mới nhất khác trạng thái hiện tại thì
 * tải lại lịch sử, mỗi trạng thái đúng một lần để không lặp mãi nếu máy chủ thật sự thiếu mốc.
 */
export function useHistoryInSync(
  currentStatus: string | undefined,
  historyStatus: string | undefined,
  fetching: boolean,
  refetch: () => void,
) {
  const retriedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!currentStatus || !historyStatus || fetching) return;
    if (historyStatus === currentStatus || retriedFor.current === currentStatus) return;
    retriedFor.current = currentStatus;
    refetch();
  }, [currentStatus, historyStatus, fetching, refetch]);
}
