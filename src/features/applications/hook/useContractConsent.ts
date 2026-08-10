import { useRef, useState } from 'react';
import { generateIdempotencyKey } from '@/lib/api';
import type { LoanContractDetail } from '@/types/contract';
import { useDeclineContractMutation, useSignContractMutation } from '../api/applicationApi';
import type { DeclineReasonCode } from '../constant';
import { toActionError, type ActionError } from '../mappers/apiError';

export type ContractConsentState = {
  sign: () => Promise<boolean>;
  decline: (reasonCode: DeclineReasonCode, reasonDetail: string) => Promise<boolean>;
  signing: boolean;
  declining: boolean;
  busy: boolean;
  error: ActionError | null;
  clearError: () => void;
};

/**
 * Hai hành động ký và từ chối hợp đồng.
 *
 * Mỗi hành động giữ một idempotency key riêng. Key chỉ được đổi sau khi backend
 * xác nhận thành công; khi lỗi hoặc timeout thì cố tình dùng lại key cũ để lần
 * bấm sau là *cùng một ý định*, không tạo ra hai lần ký.
 * `version` và `documentHash` lấy nguyên từ contract đang hiển thị — đúng bản
 * mà người dùng vừa đọc và chấp thuận.
 */
export function useContractConsent(contract: LoanContractDetail): ContractConsentState {
  const [signContract, signState] = useSignContractMutation();
  const [declineContract, declineState] = useDeclineContractMutation();
  const [error, setError] = useState<ActionError | null>(null);
  const signKey = useRef(generateIdempotencyKey());
  const declineKey = useRef(generateIdempotencyKey());

  const busy = signState.isLoading || declineState.isLoading;

  const sign = async (): Promise<boolean> => {
    if (busy) return false;
    setError(null);
    try {
      await signContract({
        contractNumber: contract.contractNumber,
        version: contract.version,
        documentHash: contract.documentHash,
        idempotencyKey: signKey.current,
      }).unwrap();
      signKey.current = generateIdempotencyKey();
      return true;
    } catch (caught) {
      setError(toActionError(caught));
      return false;
    }
  };

  const decline = async (
    reasonCode: DeclineReasonCode,
    reasonDetail: string,
  ): Promise<boolean> => {
    if (busy) return false;
    setError(null);
    try {
      await declineContract({
        contractNumber: contract.contractNumber,
        version: contract.version,
        reasonCode,
        reasonDetail: reasonDetail.trim() || undefined,
        idempotencyKey: declineKey.current,
      }).unwrap();
      declineKey.current = generateIdempotencyKey();
      return true;
    } catch (caught) {
      setError(toActionError(caught));
      return false;
    }
  };

  return {
    sign,
    decline,
    signing: signState.isLoading,
    declining: declineState.isLoading,
    busy,
    error,
    clearError: () => setError(null),
  };
}
