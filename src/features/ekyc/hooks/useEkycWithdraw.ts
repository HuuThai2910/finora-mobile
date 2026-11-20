import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useSubmit } from '@/hooks/useSubmit';
import { withdrawEkycReview } from '../api/ekycApi';
import { WITHDRAW_COPY } from '../constants/messages';
import { useEkycFlow } from './useEkycFlow';
import { useRefreshProfile } from './useRefreshProfile';

/**
 * Rút lại hồ sơ đang chờ nhân viên duyệt (hộp xác nhận trước), rồi về đầu luồng eKYC.
 *
 * Thành công: tải lại hồ sơ trong phiên (tab Hồ sơ về "chưa định danh") rồi mở lại màn điều khoản. Lỗi — kể cả
 * `409` khi nhân viên vừa duyệt/từ chối đúng lúc — hiện nguyên câu server trả và vẫn tải lại hồ sơ, vì trạng thái
 * thật có thể đã đổi. Cờ chống bấm lặp của `useSubmit` ngăn gửi hai lần.
 */
export function useEkycWithdraw() {
  const flow = useEkycFlow();
  const refreshProfile = useRefreshProfile();
  const action = useSubmit(useCallback(() => withdrawEkycReview(), []));

  const withdraw = async () => {
    const result = await action.submit();
    await refreshProfile();
    if (result) flow.restartFromConsent();
  };

  const confirmAndWithdraw = () =>
    Alert.alert(WITHDRAW_COPY.confirmTitle, WITHDRAW_COPY.confirmBody, [
      { text: WITHDRAW_COPY.cancel, style: 'cancel' },
      { text: WITHDRAW_COPY.confirmAction, style: 'destructive', onPress: () => void withdraw() },
    ]);

  return { confirmAndWithdraw, submitting: action.submitting, error: action.error };
}
