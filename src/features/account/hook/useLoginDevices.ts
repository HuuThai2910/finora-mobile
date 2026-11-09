import { useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { toUserMessage } from '@/lib/api';
import { getMyDevices, signOutDevice } from '../api';

/**
 * Danh sách "Thiết bị đăng nhập" và thao tác đăng xuất một thiết bị khác. Đăng xuất xong thì tải lại danh sách; lỗi
 * hiện ngay trên màn (không đóng màn).
 */
export function useLoginDevices() {
  const state = useAsync(getMyDevices, []);
  const [signingOutId, setSigningOutId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const signOut = async (id: number) => {
    setSigningOutId(id);
    setActionError(null);
    try {
      await signOutDevice(id);
      state.reload();
    } catch (e) {
      setActionError(toUserMessage(e));
    } finally {
      setSigningOutId(null);
    }
  };

  return { ...state, signingOutId, actionError, signOut };
}
