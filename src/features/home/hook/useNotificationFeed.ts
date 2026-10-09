import { useCallback, useMemo, useState } from 'react';
import { toUserMessage } from '@/lib/api';
import { markNotificationRead } from '../api';
import { groupNotifications, type NotificationGroup } from '../mappers/notificationFeed';
import { useNotifications } from './useHome';

export type NotificationFeed = {
  /** `loading` chỉ ở lần tải đầu; kéo làm mới vẫn giữ danh sách cũ trên màn. */
  phase: 'loading' | 'error' | 'ready';
  error: string | null;
  groups: NotificationGroup[];
  counts: { all: number; unread: number };
  refreshing: boolean;
  refresh: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  markingAll: boolean;
  /** Lỗi khi đánh dấu đã đọc; danh sách vẫn hiện, chỉ kèm một dòng báo. */
  actionError: string | null;
};

/**
 * Dữ liệu và thao tác của màn Thông báo.
 *
 * Đánh dấu đã đọc theo kiểu lạc quan: chấm đỏ mất ngay khi bấm, gọi API sau;
 * lỗi thì trả tin về trạng thái chưa đọc và báo lỗi. Không tải lại cả danh sách
 * sau mỗi lần bấm, vì backend chỉ đổi đúng cờ đã đọc của tin đó.
 */
export function useNotificationFeed(): NotificationFeed {
  const { data, loading, error, reload } = useNotifications();
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set());
  const [markingAll, setMarkingAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const items = useMemo(
    () => (data ?? []).map(n => (n.unread && readIds.has(n.id) ? { ...n, unread: false } : n)),
    [data, readIds],
  );
  const unreadIds = useMemo(() => items.filter(n => n.unread).map(n => n.id), [items]);
  // Không lọc: tin chưa đọc nằm lẫn theo thời gian, nhận ra nhờ chấm đỏ trên thẻ.
  const groups = useMemo(() => groupNotifications(items), [items]);

  const addRead = useCallback((ids: readonly string[]) => {
    setReadIds(prev => new Set([...prev, ...ids]));
  }, []);
  const undoRead = useCallback((ids: readonly string[]) => {
    setReadIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  }, []);

  const markRead = useCallback(
    (id: string) => {
      setActionError(null);
      addRead([id]);
      markNotificationRead(id).catch((e: unknown) => {
        undoRead([id]);
        setActionError(toUserMessage(e));
      });
    },
    [addRead, undoRead],
  );

  const markAllRead = useCallback(() => {
    if (markingAll || unreadIds.length === 0) return;
    const ids = unreadIds;
    setActionError(null);
    setMarkingAll(true);
    addRead(ids);
    void Promise.allSettled(ids.map(id => markNotificationRead(id))).then(results => {
      const failed = ids.filter((_, i) => results[i]?.status === 'rejected');
      if (failed.length > 0) {
        undoRead(failed);
        setActionError(`Chưa đánh dấu được ${failed.length} thông báo, vui lòng thử lại.`);
      }
      setMarkingAll(false);
    });
  }, [markingAll, unreadIds, addRead, undoRead]);

  const refresh = useCallback(() => {
    setActionError(null);
    reload();
  }, [reload]);

  return {
    // Có lỗi thì báo lỗi kèm nút thử lại, kể cả khi còn dữ liệu cũ, thay vì lặng lẽ hiện danh sách lỗi thời.
    phase: loading && !data ? 'loading' : error ? 'error' : 'ready',
    error,
    groups,
    counts: { all: items.length, unread: unreadIds.length },
    refreshing: loading && !!data,
    refresh,
    markRead,
    markAllRead,
    markingAll,
    actionError,
  };
}
