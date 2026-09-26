import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { apiFetchResponse } from '@/lib/api';
import type { LoanContractDetail } from '@/types/contract';

export type ContractPdfState = {
  openPdf: () => Promise<boolean>;
  sharePdf: () => Promise<void>;
  opening: boolean;
  sharing: boolean;
  error: string | null;
  previewUri: string | null;
  closePreview: () => void;
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
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const cachedNativeFile = useRef<{ contractNumber: string; file: File } | null>(null);
  const previewObjectUrl = useRef<string | null>(null);

  const requirePath = useCallback((): string => {
    if (!contract.pdfDocument) {
      throw new Error('Hợp đồng cũ chưa có bản PDF từ máy chủ.');
    }
    return contract.pdfDocument.downloadPath;
  }, [contract.pdfDocument]);

  /** Tải PDF qua API client để request có bearer token và tự refresh khi 401. */
  const fetchPdf = useCallback(async (): Promise<Response> => {
    const response = await apiFetchResponse(requirePath(), {
      headers: { Accept: 'application/pdf' },
      timeoutMs: 30_000,
    });
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.includes('application/pdf')) {
      throw new Error('Máy chủ không trả về tài liệu PDF hợp lệ.');
    }
    return response;
  }, [requirePath]);

  const nativeFile = useCallback(async (): Promise<File> => {
    const cached = cachedNativeFile.current;
    if (cached?.contractNumber === contract.contractNumber && cached.file.exists) {
      return cached.file;
    }

    const response = await fetchPdf();
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength === 0) throw new Error('Tài liệu PDF đang rỗng.');

    const target = new File(Paths.cache, `${contract.contractNumber}.pdf`);
    target.create({ intermediates: true, overwrite: true });
    target.write(bytes);
    cachedNativeFile.current = { contractNumber: contract.contractNumber, file: target };
    return target;
  }, [contract.contractNumber, fetchPdf]);

  const webBlobUrl = useCallback(async (): Promise<string> => {
    const response = await fetchPdf();
    const blob = await response.blob();
    if (blob.size === 0) throw new Error('Tài liệu PDF đang rỗng.');
    return URL.createObjectURL(blob);
  }, [fetchPdf]);

  const closePreview = useCallback(() => {
    if (previewObjectUrl.current) {
      URL.revokeObjectURL(previewObjectUrl.current);
      previewObjectUrl.current = null;
    }
    setPreviewUri(null);
  }, []);

  useEffect(() => closePreview, [closePreview]);

  const openPdf = useCallback(async (): Promise<boolean> => {
    if (opening) return false;
    setOpening(true);
    setError(null);

    try {
      if (Platform.OS === 'web') {
        const objectUrl = await webBlobUrl();
        if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
        previewObjectUrl.current = objectUrl;
        setPreviewUri(objectUrl);
      } else {
        const file = await nativeFile();
        setPreviewUri(file.uri);
      }
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể mở bản PDF hợp đồng.');
      return false;
    } finally {
      setOpening(false);
    }
  }, [contract.contractNumber, nativeFile, opening, webBlobUrl]);

  const sharePdf = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    setError(null);

    try {
      if (Platform.OS === 'web') {
        const objectUrl = await webBlobUrl();
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `${contract.contractNumber}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        return;
      }

      const file = await nativeFile();
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
  }, [contract.contractNumber, nativeFile, sharing, webBlobUrl]);

  return {
    openPdf,
    sharePdf,
    opening,
    sharing,
    error,
    previewUri,
    closePreview,
    clearError: () => setError(null),
  };
}
