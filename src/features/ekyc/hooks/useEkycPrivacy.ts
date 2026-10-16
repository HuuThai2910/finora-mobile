import { useCallback, useState } from 'react';
import { getMyProfile } from '@/features/auth';
import { useAsync } from '@/hooks/useAsync';
import { useSubmit } from '@/hooks/useSubmit';
import { toUserMessage } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import type { EkycConsent } from '@/types/ekyc';
import { getEkycConsent, withdrawEkycConsent } from '../api/ekycApi';
import { useEkycSession } from './useEkycSession';

const WITHDRAWN_MESSAGE =
  'Đã rút lại đồng ý. Ảnh thẻ, video và kết quả xác minh đã được xoá; tài khoản trở về trạng thái chưa xác minh.';

/**
 * Dữ liệu màn "Quyền riêng tư eKYC": trạng thái đồng ý hiện hành và thao tác rút lại.
 *
 * Rút lại thành công thì: giữ bản điều khoản server trả (`accepted=false`) thay cho bản đã tải,
 * xoá phiên eKYC đang dở trong bộ nhớ, và tải lại hồ sơ trong phiên để nhãn định danh ở màn
 * Hồ sơ đổi ngay. Tải lại hồ sơ lỗi chỉ ghi cảnh báo — việc rút lại phía server đã xong.
 */
export function useEkycPrivacy() {
  const loaded = useAsync(signal => getEkycConsent(signal), []);
  const [latest, setLatest] = useState<EkycConsent | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const { updateProfile } = useAuth();
  const { reset } = useEkycSession();
  const withdraw = useSubmit(useCallback(() => withdrawEkycConsent(), []));

  const confirmWithdraw = async () => {
    setDone(null);
    const next = await withdraw.submit();
    if (!next) return; // lỗi — `withdraw.error` đã giữ thông điệp
    setLatest(next);
    reset();
    setDone(WITHDRAWN_MESSAGE);
    try {
      updateProfile(await getMyProfile());
    } catch (e) {
      console.warn('Không tải lại được hồ sơ sau khi rút lại đồng ý:', toUserMessage(e));
    }
  };

  const reload = () => {
    setLatest(null);
    loaded.reload();
  };

  return {
    consent: latest ?? loaded.data,
    loading: loaded.loading,
    error: loaded.error,
    reload,
    withdraw: confirmWithdraw,
    withdrawing: withdraw.submitting,
    withdrawError: withdraw.error,
    done,
  };
}
