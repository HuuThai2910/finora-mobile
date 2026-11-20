import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubmit } from '@/hooks/useSubmit';
import type { ProfileStackParamList } from '@/navigation/types';
import type { EkycConfirmEdits, EkycConfirmOptions } from '@/types/ekyc';
import { confirmEkyc } from '../api/ekycApi';
import { resultMessage } from '../constants/messages';
import { isFinalOutcome } from '../mappers/result';
import { useEkycFlow } from './useEkycFlow';
import { useEkycSession } from './useEkycSession';
import { useRefreshProfile } from './useRefreshProfile';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

/**
 * Xác nhận bản nháp (`POST /ekyc-confirm`) và định tuyến theo kết quả:
 * - `VERIFIED` / `REVIEW_PENDING` → màn kết quả cuối, tải lại hồ sơ trong phiên để nhãn định
 *   danh đổi ngay (chạy nền, lỗi chỉ ghi cảnh báo — màn Hồ sơ cũng tự tải lại khi quay về);
 * - `reportIncorrect` (lần soát thứ `REPORT_TO_STAFF_AT`): kết quả luôn `REVIEW_PENDING`;
 * - `LIVENESS_REQUIRED` → về màn kiểm tra khuôn mặt;
 * - lỗi tạm thời → báo tại chỗ, giữ nguyên bản nháp và bản sửa;
 * - còn lại (bản nháp hết hạn, số đã dùng...) → màn kết quả hiện lý do.
 * Lỗi `400 EDIT_NOT_ALLOWED` đến dạng `ApiError` và hiện nguyên thông điệp server.
 */
export function useEkycConfirm() {
  const nav = useNavigation<Nav>();
  const session = useEkycSession();
  const flow = useEkycFlow();
  const refreshProfile = useRefreshProfile();
  const [inlineError, setInlineError] = useState<string | null>(null);
  const confirm = useSubmit(
    useCallback((edits: EkycConfirmEdits, options?: EkycConfirmOptions) => confirmEkyc(edits, options), []),
  );

  const submit = async (edits: EkycConfirmEdits, options?: EkycConfirmOptions) => {
    setInlineError(null);
    const result = await confirm.submit(edits, options);
    if (!result) return;

    if (isFinalOutcome(result)) {
      flow.showFinal(result);
      void refreshProfile();
      return;
    }
    switch (result.resultCode) {
      case 'LIVENESS_REQUIRED':
        nav.navigate('EkycLiveness');
        return;
      case 'RATE_LIMITED':
      case 'AI_UNAVAILABLE':
      case 'STORAGE_UNAVAILABLE':
        setInlineError(resultMessage(result.resultCode, result.message));
        return;
      default:
        session.setOutcome(result);
    }
  };

  return { submit, submitting: confirm.submitting, error: inlineError ?? confirm.error };
}
