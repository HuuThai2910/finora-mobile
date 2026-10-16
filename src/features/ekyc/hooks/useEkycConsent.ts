import { useCallback } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { useSubmit } from '@/hooks/useSubmit';
import { ApiError } from '@/lib/api';
import type { EkycConsent } from '@/types/ekyc';
import { acceptEkycConsent, getEkycConsent } from '../api/ekycApi';

export type AcceptOutcome = { kind: 'accepted'; consent: EkycConsent } | { kind: 'stale'; message: string };

/**
 * Điều khoản eKYC hiện hành và thao tác đồng ý.
 *
 * - Tải `GET /ekyc/consent` khi mở màn; nội dung luôn lấy từ server, không viết cứng trong app.
 * - `accept` gửi đúng `version` + `textSha256` của bản đang hiển thị. Nếu điều khoản vừa đổi
 *   phía server, nhận `409 CONSENT_VERSION_STALE` → trả `stale` để màn tải lại bản mới và bắt
 *   người dùng đọc lại, thay vì báo lỗi chung.
 */
export function useEkycConsent() {
  const consent = useAsync(signal => getEkycConsent(signal), []);

  const acceptAction = useCallback(async (current: EkycConsent): Promise<AcceptOutcome> => {
    try {
      return { kind: 'accepted', consent: await acceptEkycConsent(current) };
    } catch (e) {
      if (e instanceof ApiError && e.code === 'CONSENT_VERSION_STALE') {
        return {
          kind: 'stale',
          message: e.serverMessage ?? 'Điều khoản vừa được cập nhật. Vui lòng đọc lại trước khi đồng ý.',
        };
      }
      throw e;
    }
  }, []);
  const accept = useSubmit(acceptAction);

  return { consent, accept };
}
