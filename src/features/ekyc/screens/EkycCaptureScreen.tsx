import { useCallback, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation/types';
import CameraPermissionGate from '../components/CameraPermissionGate';
import ScanLine from '../components/ScanLine';
import { CAPTURE_HINT, CCCD_FRAME_HEIGHT, CCCD_QUALITY, CCCD_WIDTH } from '../constants';
import { useEkycSession } from '../hooks/useEkycSession';
import { captureBase64 } from '@/lib/camera';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'EkycCapture'>;

type Preview = { uri: string; base64: string };

/**
 * Màn 3 — chụp mặt trước CCCD.
 *
 * Chỉ chụp **một** ảnh: backend dùng đúng ảnh này cho cả OCR lẫn so khớp khuôn
 * mặt, không dùng tới mặt sau. Ảnh giữ ở độ phân giải cao hơn frame liveness vì
 * OCR phải đọc được dãy số nhỏ trên thẻ.
 */
export default function EkycCaptureScreen() {
  const nav = useNavigation<Nav>();
  const { setCccdImage } = useEkycSession();
  const cameraRef = useRef<CameraView>(null);

  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCapture = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const shot = await captureBase64(cameraRef.current, {
        width: CCCD_WIDTH,
        quality: CCCD_QUALITY,
      });
      if (!shot) {
        setError('Không chụp được ảnh, vui lòng thử lại.');
        return;
      }
      setPreview(shot);
    } finally {
      setBusy(false);
    }
  }, []);

  const onConfirm = useCallback(() => {
    if (!preview) return;
    setCccdImage(preview.base64);
    nav.navigate('Liveness');
  }, [nav, preview, setCccdImage]);

  return (
    <Screen light>
      <CameraPermissionGate>
      <Text style={styles.title} accessibilityRole="header">
        Chụp ảnh CCCD
      </Text>
      <Text style={styles.sub}>Mặt trước, thẻ nằm gọn trong khung</Text>

      <View style={styles.frame}>
        {preview ? (
          <Image
            source={{ uri: preview.uri }}
            style={styles.fill}
            resizeMode="cover"
            accessibilityLabel="Ảnh CCCD vừa chụp"
          />
        ) : (
          <>
            <CameraView ref={cameraRef} style={styles.fill} facing="back" />
            <ScanLine height={CCCD_FRAME_HEIGHT} />
          </>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {preview ? (
        <View style={styles.actions}>
          <Button
            label="Chụp lại"
            variant="outline"
            onPress={() => setPreview(null)}
            style={styles.grow}
          />
          <Button label="Tiếp tục" icon="check" onPress={onConfirm} style={styles.grow} />
        </View>
      ) : (
        <Button
          label="Chụp"
          icon="scan"
          loading={busy}
          disabled={busy}
          onPress={() => void onCapture()}
          style={styles.action}
        />
      )}

      <Text style={styles.hint}>{CAPTURE_HINT}</Text>
      </CameraPermissionGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...Text_.heading, color: Colors.ink, textAlign: 'center', marginTop: Spacing.xl },
  sub: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xs },
  frame: {
    height: CCCD_FRAME_HEIGHT,
    marginVertical: Spacing.xxl,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: Colors.brand,
    borderRadius: Radius.xl,
    backgroundColor: Colors.brand50,
    overflow: 'hidden',
  },
  fill: { flex: 1 },
  actions: { flexDirection: 'row', gap: Spacing.lg },
  grow: { flex: 1 },
  action: { marginTop: Spacing.md },
  error: { ...Text_.micro, color: Colors.red, textAlign: 'center', marginBottom: Spacing.lg },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
