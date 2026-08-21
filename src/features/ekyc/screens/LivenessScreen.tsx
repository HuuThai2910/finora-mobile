import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, ProgressBar } from '@/components/ui';
import { captureBase64 } from '@/lib/camera';
import type { AuthStackParamList } from '@/navigation/types';
import type { EkycVerifyResult } from '@/types/ekyc';
import CameraPermissionGate from '../components/CameraPermissionGate';
import LivenessActionList from '../components/LivenessActionList';
import { FRAME_QUALITY, FRAME_WIDTH, LIVENESS_HINT } from '../constants';
import { useEkycSession } from '../hooks/useEkycSession';
import { useLivenessCapture, type CaptureStatus } from '../hooks/useLivenessCapture';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Liveness'>;

const STATUS_TEXT: Record<CaptureStatus, string> = {
  idle: 'Giữ khuôn mặt trong khung tròn',
  preparing: 'Đang lấy yêu cầu xác minh…',
  recording: 'Làm theo thứ tự bên dưới, giữ mặt trong khung',
  verifying: 'Đang xác minh, có thể mất vài chục giây…',
};

/**
 * Màn 5 — xác minh khuôn mặt bằng active liveness.
 *
 * Người dùng phải làm đúng chuỗi động tác server sinh ngẫu nhiên cho phiên này.
 * Máy ảnh chụp thành loạt frame rồi gửi kèm ảnh CCCD ở màn trước; server tự
 * chọn frame tốt nhất để so khớp khuôn mặt nên client không cần chọn hộ.
 */
export default function LivenessScreen() {
  const nav = useNavigation<Nav>();
  const { cccdImageBase64, setResult } = useEkycSession();
  const cameraRef = useRef<CameraView>(null);

  const captureFrame = useCallback(async () => {
    const shot = await captureBase64(cameraRef.current, {
      width: FRAME_WIDTH,
      quality: FRAME_QUALITY,
    });
    return shot?.base64 ?? null;
  }, []);

  const onVerified = useCallback(
    (result: EkycVerifyResult) => {
      setResult(result);
      nav.navigate('EkycResult');
    },
    [nav, setResult],
  );

  const { challenge, status, capturedCount, totalFrames, error, busy, start } = useLivenessCapture({
    captureFrame,
    cccdImageBase64,
    onVerified,
  });

  // Mất ảnh CCCD nghĩa là người dùng vào thẳng màn này (ví dụ back rồi tiến
  // lại) — gửi lên sẽ chắc chắn hỏng, nên đưa họ về đúng bước còn thiếu.
  if (!cccdImageBase64) {
    return (
      <Screen light>
        <View style={styles.head}>
          <Text style={styles.title} accessibilityRole="header">
            Thiếu ảnh CCCD
          </Text>
          <Text style={styles.sub}>Hãy chụp lại ảnh mặt trước CCCD trước khi xác minh.</Text>
        </View>
        <Button
          label="Chụp ảnh CCCD"
          icon="scan"
          onPress={() => nav.navigate('EkycCapture')}
          style={styles.action}
        />
      </Screen>
    );
  }

  return (
    <Screen light>
      <CameraPermissionGate>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Xác minh khuôn mặt
        </Text>
        <Text style={styles.sub}>{STATUS_TEXT[status]}</Text>
      </View>

      <View style={styles.circle}>
        <CameraView ref={cameraRef} style={styles.fill} facing="front" />
      </View>

      {challenge ? (
        <LivenessActionList actions={challenge.actions} active={status === 'recording'} />
      ) : (
        <Text style={styles.hint}>{LIVENESS_HINT}</Text>
      )}

      {status === 'recording' ? (
        <View style={styles.progress}>
          <ProgressBar percent={(capturedCount / totalFrames) * 100} label="Tiến độ chụp ảnh" />
          <Text style={styles.progressText}>
            Đã chụp {capturedCount}/{totalFrames} ảnh
          </Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={challenge ? 'Quay lại từ đầu' : 'Bắt đầu'}
        icon="users"
        loading={busy}
        disabled={busy}
        onPress={() => void start()}
        style={styles.action}
      />
      </CameraPermissionGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.xl },
  title: { ...Text_.heading, color: Colors.ink, textAlign: 'center' },
  sub: { ...Text_.micro, color: Colors.ink3, textAlign: 'center' },
  circle: {
    width: 240,
    height: 240,
    borderRadius: Radius.pill,
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: Colors.brand,
    backgroundColor: Colors.brand50,
    alignSelf: 'center',
    marginVertical: Spacing.xxl,
    overflow: 'hidden',
  },
  fill: { flex: 1 },
  progress: { marginTop: Spacing.xl, gap: Spacing.sm },
  progressText: { ...Text_.micro, color: Colors.ink3, textAlign: 'center' },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center' },
  error: { ...Text_.micro, color: Colors.red, textAlign: 'center', marginTop: Spacing.lg },
  action: { marginTop: Spacing.xl },
});
