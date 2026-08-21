import { useCallback, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button } from '@/components/ui';
import type { EkycStackParamList } from '@/navigation/types';
import { captureBase64 } from '@/lib/camera';
import CameraPermissionGate from '../components/CameraPermissionGate';
import ScanLine from '../components/ScanLine';
import {
  CAPTURE_HINT,
  CAPTURE_SUB,
  CAPTURE_TITLE,
  CCCD_FRAME_HEIGHT,
  CCCD_QUALITY,
  CCCD_WIDTH,
} from '../constants';
import { useEkycSession } from '../hooks/useEkycSession';
import { useEkycVerify } from '../hooks/useEkycVerify';

type Nav = NativeStackNavigationProp<EkycStackParamList, 'EkycCapture'>;

type Preview = { uri: string; base64: string };

/**
 * Chụp một mặt CCCD — màn dùng chung cho cả hai mặt, phân biệt qua param `side`.
 *
 * Mặt trước xác nhận xong thì push chính màn này với `side: 'back'`; mặt sau
 * xác nhận xong thì gửi luôn hai ảnh đi xác minh (không còn bước liveness).
 * Backend chỉ OCR mặt trước; mặt sau là bằng chứng cầm thẻ đầy đủ.
 */
export default function EkycCaptureScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<EkycStackParamList, 'EkycCapture'>>();
  const side = route.params?.side ?? 'front';

  const { cccdFrontBase64, setCccdImage, setResult } = useEkycSession();
  const verify = useEkycVerify();
  const cameraRef = useRef<CameraView>(null);

  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const onCapture = useCallback(async () => {
    setBusy(true);
    setCaptureError(null);
    try {
      const shot = await captureBase64(cameraRef.current, {
        width: CCCD_WIDTH,
        quality: CCCD_QUALITY,
      });
      if (!shot) {
        setCaptureError('Không chụp được ảnh, vui lòng thử lại.');
        return;
      }
      setPreview(shot);
    } finally {
      setBusy(false);
    }
  }, []);

  const onConfirm = useCallback(async () => {
    if (!preview) return;
    setCccdImage(side, preview.base64);

    if (side === 'front') {
      nav.push('EkycCapture', { side: 'back' });
      return;
    }

    // Mặt sau: đủ hai ảnh — gửi xác minh ngay tại đây. OCR có thể mất vài chục
    // giây nên nút chuyển sang trạng thái loading trong lúc chờ.
    if (!cccdFrontBase64) return;
    const result = await verify.submit(cccdFrontBase64, preview.base64);
    if (!result) return;

    setResult(result);
    nav.navigate('EkycResult');
  }, [cccdFrontBase64, nav, preview, setCccdImage, setResult, side, verify]);

  // Vào thẳng màn mặt sau mà chưa có ảnh mặt trước (back rồi tiến lại) —
  // đưa người dùng về đúng bước còn thiếu thay vì gửi thiếu ảnh.
  if (side === 'back' && !cccdFrontBase64) {
    return (
      <Screen light>
        <View style={styles.missingHead}>
          <Text style={styles.title} accessibilityRole="header">
            Thiếu ảnh mặt trước
          </Text>
          <Text style={styles.sub}>Hãy chụp mặt trước CCCD trước khi chụp mặt sau.</Text>
        </View>
        <Button
          label="Chụp mặt trước"
          icon="scan"
          onPress={() => nav.navigate('EkycCapture', { side: 'front' })}
          style={styles.action}
        />
      </Screen>
    );
  }

  return (
    <Screen light>
      <CameraPermissionGate>
        <Text style={styles.title} accessibilityRole="header">
          {CAPTURE_TITLE[side]}
        </Text>
        <Text style={styles.sub}>{CAPTURE_SUB[side]}</Text>

        <View style={styles.frame}>
          {preview ? (
            <Image
              source={{ uri: preview.uri }}
              style={styles.fill}
              resizeMode="cover"
              accessibilityLabel={`Ảnh ${side === 'front' ? 'mặt trước' : 'mặt sau'} CCCD vừa chụp`}
            />
          ) : (
            <>
              <CameraView ref={cameraRef} style={styles.fill} facing="back" />
              <ScanLine height={CCCD_FRAME_HEIGHT} />
            </>
          )}
        </View>

        {captureError ? <Text style={styles.error}>{captureError}</Text> : null}
        {verify.error ? <Text style={styles.error}>{verify.error}</Text> : null}

        {preview ? (
          <View style={styles.actions}>
            <Button
              label="Chụp lại"
              variant="outline"
              onPress={() => setPreview(null)}
              disabled={verify.submitting}
              style={styles.grow}
            />
            <Button
              label={side === 'front' ? 'Tiếp tục' : 'Gửi xác minh'}
              icon="check"
              loading={verify.submitting}
              disabled={verify.submitting}
              onPress={() => void onConfirm()}
              style={styles.grow}
            />
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
  missingHead: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.section },
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
