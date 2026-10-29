import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CameraView, type BarcodeSettings } from 'expo-camera';
import { Colors } from '@/constants/colors';
import { Radius, SCREEN_PADDING, Spacing, Text_ } from '@/theme';
import { Button, SegmentGroup } from '@/components/ui';
import { captureBurst, pickBestPictureSize } from '@/lib/camera';
import CameraPermissionGate from '../components/CameraPermissionGate';
import QrReadBadge from '../components/QrReadBadge';
import ScanLine from '../components/ScanLine';
import {
  CARD_BURST_MAX_MS,
  CARD_BURST_SHOTS,
  CCCD_FRAME_HEIGHT,
  DEFAULT_ZOOM_INDEX,
  DISTANCE_HINT,
  ZOOM_PRESETS,
} from '../constants/capture';
import { useLiveQrScan } from '../hooks/useLiveQrScan';
import { finalizeCardShot } from './cardImage';
import type { CaptureViewProps, CardCaptureSource } from './types';

const QR_SETTINGS: BarcodeSettings = { barcodeTypes: ['qr'] };

const ZOOM_OPTIONS = ZOOM_PRESETS.map((preset, index) => ({ value: index, label: preset.label }));

const describe = (e: unknown): string => (e instanceof Error ? e.message : 'lỗi không xác định');

/**
 * Khung ngắm CCCD bằng `CameraView` ngay trong app — nguồn chụp mặc định.
 *
 * Chống mờ: không truyền `autofocus` (giá trị "on" của expo-camera 57 nghĩa là lấy nét một
 * lần rồi khoá), preset phóng to để giữ máy cách ~20 cm, chụp loạt 2–3 tấm giữ tấm nét nhất,
 * không nén ở bước chụp. QR được quét sống trên preview; chưa có thì dò lại trên ảnh gốc.
 */
function InAppCaptureView({ active, disabled, otherSideHasQr, onCaptured }: CaptureViewProps) {
  const cameraRef = useRef<CameraView>(null);
  const { width: windowWidth } = useWindowDimensions();
  // Khung ngắm rộng bằng màn trừ lề chuẩn, cao cố định — ảnh được cắt đúng vùng này để
  // tấm thẻ choán gần trọn ảnh gửi đi.
  const frameAspect = (windowWidth - SCREEN_PADDING * 2) / CCCD_FRAME_HEIGHT;

  const { cameraKey, seen, onBarcodeScanned, onCameraReady: onQrCameraReady, freshQr, pause, resume } =
    useLiveQrScan(!otherSideHasQr);
  const [mountAttempt, setMountAttempt] = useState(0);
  const [pictureSize, setPictureSize] = useState<string | undefined>(undefined);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mountFailed, setMountFailed] = useState(false);

  // Expo Go mặc định chụp ở độ phân giải thấp — hỏi máy danh sách kích thước khi camera sẵn
  // sàng và ép dùng kích thước lớn. Không đọc được thì đành dùng mặc định của hệ thống.
  const onCameraReady = useCallback(async () => {
    onQrCameraReady();
    try {
      const sizes = (await cameraRef.current?.getAvailablePictureSizesAsync()) ?? [];
      const chosen = pickBestPictureSize(sizes);
      if (chosen) setPictureSize(chosen);
    } catch (e) {
      console.warn('Không đọc được kích thước ảnh của camera:', describe(e));
    }
  }, [onQrCameraReady]);

  const onCapture = async () => {
    setBusy(true);
    setError(null);
    pause();
    // Chốt QR ngay lúc bấm: loạt ảnh mất vài giây, QR thấy sau đó không chắc thuộc ảnh này.
    const qrAtShutter = freshQr();
    try {
      const raw = await captureBurst(cameraRef.current, { shots: CARD_BURST_SHOTS, maxMs: CARD_BURST_MAX_MS });
      if (!raw) {
        setError('Không chụp được ảnh, vui lòng thử lại.');
        return;
      }
      const shot = await finalizeCardShot(raw, {
        source: 'IN_APP_CAMERA',
        liveQr: qrAtShutter,
        skipStillScan: otherSideHasQr,
        cropAspect: frameAspect,
      });
      onCaptured(shot);
    } catch (e) {
      console.warn('Xử lý ảnh thẻ thất bại:', describe(e));
      setError('Không xử lý được ảnh vừa chụp, vui lòng chụp lại.');
    } finally {
      setBusy(false);
      resume();
    }
  };

  const retryMount = () => {
    setMountFailed(false);
    setError(null);
    setMountAttempt(n => n + 1);
  };

  return (
    <CameraPermissionGate>
      <View style={styles.frame}>
        {active && !mountFailed ? (
          <CameraView
            key={`${cameraKey}-${mountAttempt}`}
            ref={cameraRef}
            style={styles.fill}
            facing="back"
            zoom={ZOOM_PRESETS[zoomIndex]?.value ?? 0}
            pictureSize={pictureSize}
            barcodeScannerSettings={QR_SETTINGS}
            onBarcodeScanned={onBarcodeScanned}
            onCameraReady={() => void onCameraReady()}
            onMountError={({ message }) => {
              console.warn('Không mở được camera:', message);
              setMountFailed(true);
              setError('Không mở được camera. Đóng ứng dụng khác đang dùng camera rồi thử lại.');
            }}
          />
        ) : null}
        <ScanLine height={CCCD_FRAME_HEIGHT} />
        {seen ? <QrReadBadge style={styles.badge} /> : null}
      </View>

      <View style={styles.zoomRow}>
        <Text style={styles.zoomLabel}>Phóng to</Text>
        <SegmentGroup
          label="Mức phóng to của khung ngắm"
          options={ZOOM_OPTIONS}
          value={zoomIndex}
          onChange={setZoomIndex}
          style={styles.zoomGroup}
        />
      </View>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {mountFailed ? (
        <Button label="Mở lại camera" variant="outline" icon="refreshCw" onPress={retryMount} style={styles.action} />
      ) : (
        <Button
          label="Chụp"
          icon="scan"
          loading={busy}
          disabled={busy || disabled}
          onPress={() => void onCapture()}
          style={styles.action}
        />
      )}
      {busy ? <Text style={styles.busy}>Đang chụp và xử lý ảnh, giữ yên máy…</Text> : null}
      <Text style={styles.hint}>{DISTANCE_HINT}</Text>
    </CameraPermissionGate>
  );
}

export const inAppCameraSource: CardCaptureSource = {
  kind: 'IN_APP_CAMERA',
  CaptureView: InAppCaptureView,
};

const styles = StyleSheet.create({
  frame: {
    height: CCCD_FRAME_HEIGHT,
    marginTop: Spacing.xxl,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: Colors.brand,
    borderRadius: Radius.xl,
    backgroundColor: Colors.brand50,
    overflow: 'hidden',
  },
  fill: { flex: 1 },
  badge: { position: 'absolute', top: Spacing.md, left: Spacing.md },
  zoomRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginTop: Spacing.lg },
  zoomLabel: { ...Text_.microBold, color: Colors.ink2 },
  zoomGroup: { flex: 1 },
  error: { ...Text_.micro, color: Colors.red, textAlign: 'center', marginTop: Spacing.lg },
  action: { marginTop: Spacing.xl },
  busy: { ...Text_.micro, color: Colors.ink2, textAlign: 'center', marginTop: Spacing.md },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.lg },
});
