import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { toUserMessage } from '@/lib/api';
import type { InvestmentContract } from '@/types/invest';
import { refreshContractSignature } from '../api';

const FIRST_POLL_MS = 3_000;
const POLL_MS = 5_000;
const MAX_POLLS = 12;

/**
 * Theo dõi giao dịch SmartCA của nhà đầu tư trong khoảng một phút.
 * Polling chỉ chạy khi ứng dụng ở foreground, dừng khi đã ký/từ chối và luôn
 * hủy timer lúc rời màn để không gọi API ngầm ngoài ý muốn.
 */
export function useInvestorSmartCa(
  contract: InvestmentContract | null,
  reload: () => void,
) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  const check = async () => {
    if (!contract || checking) return;
    setChecking(true);
    setError(null);
    try {
      await refreshContractSignature(contract);
      reload();
    } catch (caught) {
      setError(toUserMessage(caught));
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!contract || contract.status !== 'SIGNING') return undefined;

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
        const result = await refreshContractSignature(contract);
        if (result.status !== 'SIGNING') {
          reloadRef.current();
          return;
        }
      } catch {
        // Poll nền không che màn bằng lỗi; nút kiểm tra thủ công vẫn báo lỗi cụ thể.
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
  }, [contract?.reference, contract?.status]);

  return { check, checking, error };
}
