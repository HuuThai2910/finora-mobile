import { useRef, useState } from 'react';
import { generateIdempotencyKey } from '@/lib/api';
import type { LoanApplication } from '@/types/loan';
import {
  useAcceptApplicationTermsMutation,
  useDeclineApplicationTermsMutation,
} from '../api/applicationApi';
import { toActionError, type ActionError } from '../mappers/apiError';

export function useTermsConfirmation(application: LoanApplication) {
  const [acceptMutation, acceptState] = useAcceptApplicationTermsMutation();
  const [declineMutation, declineState] = useDeclineApplicationTermsMutation();
  const [error, setError] = useState<ActionError | null>(null);
  const acceptKey = useRef(generateIdempotencyKey());
  const declineKey = useRef(generateIdempotencyKey());
  const confirmation = application.termsConfirmation;

  const accept = async () => {
    if (!confirmation || acceptState.isLoading || declineState.isLoading) return false;
    setError(null);
    try {
      await acceptMutation({
        applicationNumber: application.applicationNumber,
        idempotencyKey: acceptKey.current,
        body: {
          applicationVersion: application.version,
          termsVersion: confirmation.termsVersion,
          termsHash: confirmation.termsHash,
        },
      }).unwrap();
      acceptKey.current = generateIdempotencyKey();
      return true;
    } catch (caught) {
      setError(toActionError(caught));
      return false;
    }
  };

  const decline = async (reasonCode: string, reasonDetail?: string) => {
    if (!confirmation || acceptState.isLoading || declineState.isLoading) return false;
    setError(null);
    try {
      await declineMutation({
        applicationNumber: application.applicationNumber,
        idempotencyKey: declineKey.current,
        body: {
          applicationVersion: application.version,
          termsVersion: confirmation.termsVersion,
          termsHash: confirmation.termsHash,
          reasonCode,
          reasonDetail: reasonDetail?.trim() || undefined,
        },
      }).unwrap();
      declineKey.current = generateIdempotencyKey();
      return true;
    } catch (caught) {
      setError(toActionError(caught));
      return false;
    }
  };

  return {
    accept,
    decline,
    accepting: acceptState.isLoading,
    declining: declineState.isLoading,
    busy: acceptState.isLoading || declineState.isLoading,
    error,
    clearError: () => setError(null),
  };
}
