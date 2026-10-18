import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ApiError, NetworkError, apiFetchResponse, toUserMessage } from '@/lib/api';

export type AuthenticatedPdfSource = {
  cacheKey: string;
  fileName: string;
  downloadPath: string;
};

/** Lỗi do chính luồng PDF phát hiện (tệp rỗng, sai định dạng, máy không chia sẻ được); câu đã viết cho người dùng. */
export class PdfDocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfDocumentError';
  }
}

/**
 * Câu báo lỗi mở/tải PDF cho người dùng. `ApiError.message` là chuỗi kỹ thuật `API {status}: {body}` nên lỗi HTTP và
 * lỗi mạng đi qua `toUserMessage`; lỗi lạ của hệ thống tệp hay trình chia sẻ quy về `fallback`. Đối tượng lỗi gốc
 * không đổi nên status, code và traceId vẫn còn để chẩn đoán.
 */
export function toPdfErrorMessage(cause: unknown, fallback: string): string {
  if (cause instanceof PdfDocumentError) return cause.message;
  if (cause instanceof ApiError || cause instanceof NetworkError) return toUserMessage(cause);
  return fallback;
}

/** Tải PDF có bearer token vào cache rồi mở nội bộ; không lộ token trong URL ngoài ứng dụng. */
export function useAuthenticatedPdf(source: AuthenticatedPdfSource) {
  const [opening, setOpening] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const cachedNativeFile = useRef<{ key: string; file: File } | null>(null);
  const previewObjectUrl = useRef<string | null>(null);

  const fetchPdf = useCallback(async (): Promise<Response> => {
    const response = await apiFetchResponse(source.downloadPath, {
      headers: { Accept: 'application/pdf' },
      timeoutMs: 30_000,
    });
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.includes('application/pdf')) {
      throw new PdfDocumentError('Máy chủ không trả về tài liệu PDF hợp lệ.');
    }
    return response;
  }, [source.downloadPath]);

  const nativeFile = useCallback(async (): Promise<File> => {
    const cached = cachedNativeFile.current;
    if (cached?.key === source.cacheKey && cached.file.exists) return cached.file;
    const response = await fetchPdf();
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength === 0) throw new PdfDocumentError('Tài liệu PDF đang rỗng.');
    const target = new File(Paths.cache, `${source.fileName}.pdf`);
    target.create({ intermediates: true, overwrite: true });
    target.write(bytes);
    cachedNativeFile.current = { key: source.cacheKey, file: target };
    return target;
  }, [fetchPdf, source.cacheKey, source.fileName]);

  const webBlobUrl = useCallback(async (): Promise<string> => {
    const response = await fetchPdf();
    const blob = await response.blob();
    if (blob.size === 0) throw new PdfDocumentError('Tài liệu PDF đang rỗng.');
    return URL.createObjectURL(blob);
  }, [fetchPdf]);

  const closePreview = useCallback(() => {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = null;
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
        setPreviewUri((await nativeFile()).uri);
      }
      return true;
    } catch (cause) {
      setError(toPdfErrorMessage(cause, 'Không mở được tài liệu, vui lòng thử lại.'));
      return false;
    } finally {
      setOpening(false);
    }
  }, [nativeFile, opening, webBlobUrl]);

  const sharePdf = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        const objectUrl = await webBlobUrl();
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `${source.fileName}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        return;
      }
      const file = await nativeFile();
      if (!await Sharing.isAvailableAsync()) throw new PdfDocumentError('Thiết bị không hỗ trợ lưu hoặc chia sẻ file.');
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: `Lưu hợp đồng ${source.fileName}`,
      });
    } catch (cause) {
      setError(toPdfErrorMessage(cause, 'Không tải được tài liệu, vui lòng thử lại.'));
    } finally {
      setSharing(false);
    }
  }, [nativeFile, sharing, source.fileName, webBlobUrl]);

  return { openPdf, sharePdf, opening, sharing, error, previewUri, closePreview };
}
