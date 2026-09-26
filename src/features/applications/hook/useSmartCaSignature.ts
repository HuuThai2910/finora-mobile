import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { LoanContractStatus } from '@/types/contract';
import { useRefreshContractSignatureMutation } from '../api/applicationApi';
import { toActionError } from '../mappers/apiError';

const FIRST_POLL_MS = 3_000;
const POLL_MS = 5_000;
const MAX_POLLS = 12;

/**
 * Kết quả ký VNPT SmartCA của một hợp đồng đang `SIGNING`.
 *
 * - Tự hỏi VNPT mỗi 5 giây (tối đa 12 lần, khoảng 1 phút), chỉ khi app đang ở
 *   foreground và không có lượt hỏi nào đang chạy; dừng ngay khi trạng thái
 *   thôi là `SIGNING` rồi gọi `reload` để màn lấy hợp đồng mới. Dọn timer khi
 *   rời màn hoặc trạng thái đổi.
 * - `check` cho người vay chủ động hỏi ngay; lỗi của lượt này hiện ra màn, còn
 *   lỗi của lượt hỏi nền thì bỏ qua để không làm phiền (nút vẫn báo lỗi chi tiết).
 */
export function useSmartCaSignature(
  contractNumber: string,
  status: LoanContractStatus,
  reload: () => void,
) {
  const [refreshSignature, refreshState] = useRefreshContractSignatureMutation();
  const [error, setError] = useState<string | null>(null);
  // Giữ `reload` mới nhất cho vòng hỏi nền mà không phải khởi động lại vòng hỏi.
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  const check = async () => {
    setError(null);
    try {
      await refreshSignature(contractNumber).unwrap();
      reload();
    } catch (caught) {
      setError(toActionError(caught).message);
    }
  };

  useEffect(() => {
    if (status !== 'SIGNING') return undefined;

    let cancelled = false;
    let inFlight = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      if (cancelled) return;
      if (AppState.currentState !== 'active' || inFlight) {
        timer = setTimeout(poll, POLL_MS);
        return;
      }
      if (attempts >= MAX_POLLS) return;

      attempts += 1;
      inFlight = true;
      try {
        const result = await refreshSignature(contractNumber).unwrap();
        if (result.status !== 'SIGNING') {
          reloadRef.current();
          return;
        }
      } catch {
        // Poll nền không làm gián đoạn người dùng; nút kiểm tra thủ công vẫn hiển thị lỗi chi tiết.
      } finally {
        inFlight = false;
      }
      if (!cancelled) timer = setTimeout(poll, POLL_MS);
    };

    timer = setTimeout(poll, FIRST_POLL_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [contractNumber, status, refreshSignature]);

  return { check, checking: refreshState.isLoading, error };
}
