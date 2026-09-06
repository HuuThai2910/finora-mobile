import { useCallback, useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { LoanContractDetail } from '@/types/contract';
import { buildContractPdfHtml } from '../mappers/contractDocumentPdf';

export type ContractPdfState = {
  exportPdf: () => Promise<void>;
  exporting: boolean;
  error: string | null;
  clearError: () => void;
};

/**
 * Tạo PDF cục bộ từ nội dung hợp đồng bất biến rồi mở bảng lưu/chia sẻ của hệ
 * điều hành. File chỉ là bản trình bày để người vay giữ lại; hành động ký vẫn
 * gửi version/hash của LoanContract về backend qua useContractConsent.
 */
export function useContractPdf(contract: LoanContractDetail): ContractPdfState {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPdf = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    setError(null);

    try {
      const result = await Print.printToFileAsync({
        html: buildContractPdfHtml(contract),
        width: 595,
        height: 842,
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
      });
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        throw new Error('Thiết bị không hỗ trợ lưu hoặc chia sẻ file.');
      }
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: `Lưu hợp đồng ${contract.contractNumber}`,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tạo bản PDF hợp đồng.');
    } finally {
      setExporting(false);
    }
  }, [contract, exporting]);

  return { exportPdf, exporting, error, clearError: () => setError(null) };
}
