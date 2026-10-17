import { useRef, useState } from 'react';
import { SIGNATURE_REJECTED_CODE } from '@/constants/contractSignature';
import { generateIdempotencyKey } from '@/lib/api';
import { usePinGuard } from '@/features/pin';
import type { LoanContractDetail } from '@/types/contract';
import { useDeclineContractMutation, useSignContractMutation } from '../api/applicationApi';
import type { DeclineReasonCode } from '../constant';
import { toActionError, type ActionError } from '../mappers/apiError';

/**
 * Kết quả một lần bấm ký hoặc từ chối. `error` null khi không gửi gì (đang bận, người dùng đóng bảng PIN). Trả lỗi
 * kèm kết quả để nơi gọi rẽ nhánh ngay sau `await`, không đọc `error` của lần render trước (B71).
 */
export type ConsentOutcome = { ok: true } | { ok: false; error: ActionError | null };

export type ContractConsentState = {
  sign: () => Promise<ConsentOutcome>;
  decline: (reasonCode: DeclineReasonCode, reasonDetail: string) => Promise<ConsentOutcome>;
  signing: boolean;
  declining: boolean;
  busy: boolean;
  error: ActionError | null;
  clearError: () => void;
};

const NOT_SENT: ConsentOutcome = { ok: false, error: null };

/**
 * Hai hành động ký và từ chối hợp đồng.
 *
 * Mỗi hành động giữ một idempotency key riêng. Key chỉ được đổi sau khi backend
 * xác nhận thành công; khi lỗi hoặc timeout thì cố tình dùng lại key cũ để lần
 * bấm sau là *cùng một ý định*, không tạo ra hai lần ký. Ngoại lệ duy nhất là chữ ký
 * bị từ chối (`SIGNATURE_PROVIDER_INVALID_SIGNATURE`): backend đã hủy hẳn lần ký đó nên
 * lần bấm "Ký lại" là một lần ký mới và đi với key mới (D74).
 * `version`, hash văn bản legacy và hash PDF đều lấy nguyên từ Contract đang
 * hiển thị để consent gắn đúng artifact server mà người dùng vừa đọc; với hợp đồng
 * PAdES đây vẫn là hash bản SIGNABLE như trước R5 (backend nhận, D47).
 *
 * Ký là thao tác nhạy cảm: hỏi mã PIN ngay trước lời gọi ký. Người dùng đóng bảng PIN thì
 * dừng lặng lẽ (không báo lỗi, giữ nguyên key). Từ chối hợp đồng không cần PIN.
 */
export function useContractConsent(contract: LoanContractDetail): ContractConsentState {
  const [signContract, signState] = useSignContractMutation();
  const [declineContract, declineState] = useDeclineContractMutation();
  const [error, setError] = useState<ActionError | null>(null);
  const signKey = useRef(generateIdempotencyKey());
  const declineKey = useRef(generateIdempotencyKey());
  const { requirePin } = usePinGuard();

  const busy = signState.isLoading || declineState.isLoading;

  const fail = (caught: unknown): ConsentOutcome => {
    const actionError = toActionError(caught);
    setError(actionError);
    return { ok: false, error: actionError };
  };

  const sign = async (): Promise<ConsentOutcome> => {
    if (busy) return NOT_SENT;
    setError(null);
    const pinToken = await requirePin('SIGN_CONTRACT', signKey.current);
    if (!pinToken) return NOT_SENT;
    try {
      await signContract({
        contractNumber: contract.contractNumber,
        version: contract.version,
        documentHash: contract.documentHash,
        pdfDocumentHash: contract.pdfDocument?.contentHash,
        idempotencyKey: signKey.current,
        signatureMethod: contract.availableSignatureMethod,
        pinToken,
      }).unwrap();
      signKey.current = generateIdempotencyKey();
      return { ok: true };
    } catch (caught) {
      const outcome = fail(caught);
      if (!outcome.ok && outcome.error?.code === SIGNATURE_REJECTED_CODE) {
        signKey.current = generateIdempotencyKey();
      }
      return outcome;
    }
  };

  const decline = async (
    reasonCode: DeclineReasonCode,
    reasonDetail: string,
  ): Promise<ConsentOutcome> => {
    if (busy) return NOT_SENT;
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
      return { ok: true };
    } catch (caught) {
      return fail(caught);
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
