import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { SIGNATURE_REJECTED_CODE } from '@/constants/contractSignature';
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
 * - Lỗi mạng hoặc 5xx tạm thời của lượt hỏi nền được bỏ qua để không làm phiền (nút
 *   kiểm tra thủ công vẫn báo lỗi chi tiết). Lỗi kết thúc phiên ký thì dừng hỏi và tải lại
 *   hợp đồng (B72): lỗi nghiệp vụ, hoặc chữ ký bị từ chối (`rejected`, backend đã hủy lần
 *   ký và trả hợp đồng về chờ ký nên màn mời ký lại).
 * - `check` cho người vay chủ động hỏi ngay; lỗi của lượt này hiện ra màn.
 */
export function useSmartCaSignature(
  contractNumber: string,
  status: LoanContractStatus,
  reload: () => void,
) {
  const [refreshSignature, refreshState] = useRefreshContractSignatureMutation();
  const [error, setError] = useState<string | null>(null);
  const [rejected, setRejected] = useState(false);
  // Giữ `reload` mới nhất cho vòng hỏi nền mà không phải khởi động lại vòng hỏi.
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  const check = async () => {
    setError(null);
    try {
      await refreshSignature(contractNumber).unwrap();
      reload();
    } catch (caught) {
      const actionError = toActionError(caught);
      if (actionError.code === SIGNATURE_REJECTED_CODE) {
        setRejected(true);
        reload();
        return;
      }
      setError(actionError.message);
    }
  };

  useEffect(() => {
    if (status !== 'SIGNING') return undefined;
    // Một phiên ký mới bắt đầu: lời báo chữ ký bị từ chối của lần trước không còn đúng.
    setRejected(false);

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
      } catch (caught) {
        const actionError = toActionError(caught);
        if (actionError.code === SIGNATURE_REJECTED_CODE || !actionError.retryable) {
          // Báo từ chối kể cả khi trạng thái vừa đổi (vòng hỏi đã được dọn): đó chính là lý do hợp đồng về chờ ký.
          if (actionError.code === SIGNATURE_REJECTED_CODE) setRejected(true);
          reloadRef.current();
          return;
        }
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

  return { check, checking: refreshState.isLoading, error, rejected };
}
