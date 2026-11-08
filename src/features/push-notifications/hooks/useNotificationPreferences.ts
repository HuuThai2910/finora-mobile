import { useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { toUserMessage } from '@/lib/api';
import { isMocked } from '@/lib/mockFlag';
import { getPreferences, updatePushForCategories } from '../api/pushApi';
import { CATEGORY_COPY } from '../constants/categories';
import type { PreferencesDto } from '../types';

/** Miền thông báo chạy giả: hiển thị mặc định của backend (mọi nhóm bật), không cho lưu vì không có máy chủ. */
const MOCK_PREFERENCES: PreferencesDto = {
  categories: Object.keys(CATEGORY_COPY).map(category => ({ category, pushEnabled: true, inAppEnabled: true })),
};

export type NotificationPreferencesState = {
  phase: 'loading' | 'error' | 'ready';
  error: string | null;
  pushEnabled: boolean;
  /** Đang chờ máy chủ lưu; công tắc tạm khóa để không gửi lặp. */
  saving: boolean;
  saveError: string | null;
  /** Không có backend thật: công tắc chỉ để xem. */
  readOnly: boolean;
  refreshing: boolean;
  reload: () => void;
  toggle: (pushEnabled: boolean) => void;
};

/**
 * Một công tắc push chung cho người đang đăng nhập. Backend vẫn lưu theo nhóm nên công tắc gửi cùng giá trị cho mọi
 * nhóm backend trả về trong một lần `PUT`. Công tắc hiện "bật" khi còn ít nhất một nhóm bật push, tức là máy vẫn còn
 * nhận push; tài khoản từng tắt lẻ vài nhóm ở bản cũ thì tắt rồi bật lại sẽ đưa mọi nhóm về cùng một giá trị.
 *
 * Bật/tắt kiểu lạc quan: công tắc đổi ngay; lỗi thì trả về giá trị cũ và báo một dòng lỗi, không tải lại cả màn.
 * Thông báo trong app không có công tắc vì luôn được lưu (backend D63).
 */
export function useNotificationPreferences(): NotificationPreferencesState {
  const readOnly = isMocked('notification');
  const { data, loading, error, reload } = useAsync(
    signal => (readOnly ? Promise.resolve(MOCK_PREFERENCES) : getPreferences(signal)),
    [readOnly],
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const categories = data?.categories ?? [];
  const pushEnabled = override ?? categories.some(item => item.pushEnabled);

  const toggle = (next: boolean) => {
    if (readOnly || saving || categories.length === 0) return;
    const previous = pushEnabled;
    setSaveError(null);
    setOverride(next);
    setSaving(true);
    void updatePushForCategories(
      categories.map(item => item.category),
      next,
    )
      .catch((e: unknown) => {
        setOverride(previous);
        setSaveError(toUserMessage(e));
      })
      .finally(() => setSaving(false));
  };

  return {
    phase: loading && !data ? 'loading' : error ? 'error' : 'ready',
    error,
    pushEnabled,
    saving,
    saveError,
    readOnly,
    refreshing: loading && !!data,
    reload,
    toggle,
  };
}
