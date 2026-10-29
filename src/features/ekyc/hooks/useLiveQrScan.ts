import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { BarcodeScanningResult } from 'expo-camera';
import { LIVE_QR_FRESH_MS, QR_REMOUNT_AFTER_MS, QR_REMOUNT_LIMIT } from '../constants/capture';
import { isCccdQr } from '../capture/qrScan';

/**
 * Quét QR CCCD ngay trên khung ngắm (`onBarcodeScanned`) — biện pháp chống mờ mạnh nhất cho
 * QR: trong hàng trăm khung preview chỉ cần một khung nét là đọc được.
 *
 * - Chỉ nhận chuỗi đúng định dạng QR CCCD (`^\d{12}\|`).
 * - Ghi lại thời điểm thấy mã gần nhất: lúc bấm chụp chỉ gắn QR còn "tươi" (`freshQr`), để
 *   không gắn nhầm QR của mặt kia nếu người dùng đưa nhầm mặt rồi mới lật thẻ.
 * - Lỗi expo-camera 57 trên Android: quét trong preview có thể đứng. Chưa thấy mã sau ~4 giây
 *   kể từ lúc camera sẵn sàng thì đổi `cameraKey` để dựng lại CameraView (tối đa 2 lần).
 *
 * `onBarcodeScanned` phải luôn được truyền cho CameraView: bỏ prop này khi đã đọc được mã sẽ
 * làm Android dựng lại cả camera; đã có mã thì hook chỉ cập nhật thời điểm thấy gần nhất.
 *
 * `expectQr = false` (mặt kia đã có QR — thẻ chỉ in QR ở một mặt) thì vẫn quét nhưng không dựng
 * lại camera, tránh preview nhấp nháy vô ích.
 */
export function useLiveQrScan(expectQr: boolean) {
  const [cameraKey, setCameraKey] = useState(0);
  const [seen, setSeen] = useState(false);
  const last = useRef<{ text: string; at: number } | null>(null);
  const remounts = useRef(0);
  const paused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remountAllowed = useRef(expectQr);

  // Giữ giá trị mới nhất cho hẹn giờ đang chạy mà không phải tạo lại callback của CameraView.
  useEffect(() => {
    remountAllowed.current = expectQr;
  }, [expectQr]);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const onBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (!isCccdQr(result.data)) return;
      last.current = { text: result.data, at: Date.now() };
      clearTimer();
      setSeen(true);
    },
    [clearTimer],
  );

  // Hẹn giờ dựng lại camera khi preview đã chạy mà chưa đọc được mã nào (chỉ Android).
  const onCameraReady = useCallback(() => {
    clearTimer();
    if (Platform.OS !== 'android' || !remountAllowed.current) return;
    if (last.current || remounts.current >= QR_REMOUNT_LIMIT) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      if (paused.current || last.current) return;
      remounts.current += 1;
      setCameraKey(k => k + 1);
    }, QR_REMOUNT_AFTER_MS);
  }, [clearTimer]);

  // Rời màn hoặc chụp xong thì huỷ hẹn giờ, không dựng lại camera đã gỡ.
  useEffect(() => clearTimer, [clearTimer]);

  /** QR thấy trong vài giây trước lúc gọi, hoặc `null`. */
  const freshQr = useCallback((): string | null => {
    const qr = last.current;
    return qr && Date.now() - qr.at <= LIVE_QR_FRESH_MS ? qr.text : null;
  }, []);

  /** Đang chụp/xử lý ảnh: không được dựng lại camera giữa chừng. */
  const pause = useCallback(() => {
    paused.current = true;
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    paused.current = false;
  }, []);

  return { cameraKey, seen, onBarcodeScanned, onCameraReady, freshQr, pause, resume };
}
