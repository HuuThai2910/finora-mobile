import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { loanApiUrl } from '@/lib/api/loanApi';
import type { LoanContractDetail } from '@/types/contract';

export type ContractPdfState = {
  openPdf: () => Promise<boolean>;
  sharePdf: () => Promise<void>;
  opening: boolean;
  sharing: boolean;
  error: string | null;
  clearError: () => void;
};

/**
 * Mở hoặc tải đúng PDF bất biến do Loan Service phát hành. Mobile không dựng
 * lại tài liệu nên bản người dùng đọc, hash khi ký và bản tải về là một nguồn.
 */
export function useContractPdf(contract: LoanContractDetail): ContractPdfState {
  const [opening, setOpening] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requireUrl = useCallback((): string => {
    if (!contract.pdfDocument) {
      throw new Error('Hợp đồng cũ chưa có bản PDF từ máy chủ.');
    }
    return loanApiUrl(contract.pdfDocument.downloadPath);
  }, [contract.pdfDocument]);

  const openPdf = useCallback(async (): Promise<boolean> => {
    if (opening) return false;
    setOpening(true);
    setError(null);

    try {
      await Linking.openURL(requireUrl());
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể mở bản PDF hợp đồng.');
      return false;
    } finally {
      setOpening(false);
    }
  }, [opening, requireUrl]);

  const sharePdf = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    setError(null);

    try {
      const target = new File(Paths.cache, `${contract.contractNumber}.pdf`);
      const file = await File.downloadFileAsync(requireUrl(), target, { idempotent: true });
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        throw new Error('Thiết bị không hỗ trợ lưu hoặc chia sẻ file.');
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: `Lưu hợp đồng ${contract.contractNumber}`,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải bản PDF hợp đồng.');
    } finally {
      setSharing(false);
    }
  }, [contract.contractNumber, requireUrl, sharing]);

  return { openPdf, sharePdf, opening, sharing, error, clearError: () => setError(null) };
}
