import { useCallback, useMemo, useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { toUserMessage } from '@/lib/api';
import { isMocked } from '@/lib/mockFlag';
import { getPreferences, updatePreference } from '../api/pushApi';
import { CATEGORY_COPY } from '../constants/categories';
import type { PreferenceItemDto, PreferencesDto } from '../types';

/** Miền thông báo chạy giả: hiển thị mặc định của backend (mọi nhóm bật), không cho lưu vì không có máy chủ. */
const MOCK_PREFERENCES: PreferencesDto = {
  categories: Object.keys(CATEGORY_COPY).map(category => ({ category, pushEnabled: true, inAppEnabled: true })),
};

export type NotificationPreferencesState = {
  phase: 'loading' | 'error' | 'ready';
  error: string | null;
  items: PreferenceItemDto[];
  /** Nhóm đang chờ máy chủ lưu; công tắc của nhóm đó tạm khóa để không gửi lặp. */
  saving: ReadonlySet<string>;
  saveError: string | null;
  /** Không có backend thật: công tắc chỉ để xem. */
  readOnly: boolean;
  refreshing: boolean;
  reload: () => void;
  toggle: (category: string, pushEnabled: boolean) => void;
};

/**
 * Tùy chọn push theo nhóm của người đang đăng nhập.
 *
 * Bật/tắt theo kiểu lạc quan: công tắc đổi ngay, gửi `PUT` chỉ cho nhóm đó; lỗi thì trả công tắc về giá trị cũ và báo
 * một dòng lỗi, không tải lại cả màn. Thông báo trong app không có công tắc vì luôn được lưu (backend D63).
 */
export function useNotificationPreferences(): NotificationPreferencesState {
  const readOnly = isMocked('notification');
  const { data, loading, error, reload } = useAsync(
    signal => (readOnly ? Promise.resolve(MOCK_PREFERENCES) : getPreferences(signal)),
    [readOnly],
  );
  const [overrides, setOverrides] = useState<Readonly<Record<string, boolean>>>({});
  const [saving, setSaving] = useState<ReadonlySet<string>>(() => new Set());
  const [saveError, setSaveError] = useState<string | null>(null);

  const items = useMemo(
    () =>
      (data?.categories ?? []).map(item => ({
        ...item,
        pushEnabled: overrides[item.category] ?? item.pushEnabled,
      })),
    [data, overrides],
  );

  const toggle = useCallback(
    (category: string, pushEnabled: boolean) => {
      if (readOnly || saving.has(category)) return;
      setSaveError(null);
      setOverrides(prev => ({ ...prev, [category]: pushEnabled }));
      setSaving(prev => new Set([...prev, category]));
      void updatePreference(category, pushEnabled)
        .catch((e: unknown) => {
          setOverrides(prev => {
            const next = { ...prev };
            delete next[category];
            return next;
          });
          setSaveError(toUserMessage(e));
        })
        .finally(() => {
          setSaving(prev => {
            const next = new Set(prev);
            next.delete(category);
            return next;
          });
        });
    },
    [readOnly, saving],
  );

  return {
    phase: loading && !data ? 'loading' : error ? 'error' : 'ready',
    error,
    items,
    saving,
    saveError,
    readOnly,
    refreshing: loading && !!data,
    reload,
    toggle,
  };
}
