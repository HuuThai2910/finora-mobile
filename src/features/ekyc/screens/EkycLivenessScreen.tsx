import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CameraView } from 'expo-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { IconName } from '@/constants/icons';
import { Colors } from '@/constants/colors';
import { SCREEN_PADDING, Spacing, Text_ } from '@/theme';
import { FormStepProgress, PHeader, Screen } from '@/components/phone';
import { Button, InfoNote } from '@/components/ui';
import type { ProfileStackParamList } from '@/navigation/types';
import type { LivenessStep } from '@/types/ekyc';
import CameraPermissionGate from '../components/CameraPermissionGate';
import FaceOvalFrame from '../components/FaceOvalFrame';
import LivenessPrompt from '../components/LivenessPrompt';
import LivenessTips from '../components/LivenessTips';
import { EKYC_STEP_LABEL, EKYC_STEP_TOTAL } from '../constants/capture';
import { ACTION_ICON, ACTION_PROMPT, UNKNOWN_ACTION_PROMPT } from '../constants/liveness';
import { useEkycFlow } from '../hooks/useEkycFlow';
import { useEkycSession } from '../hooks/useEkycSession';
import { useLivenessSession, type LivenessPhase } from '../hooks/useLivenessSession';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'EkycLiveness'>;

const SCREEN_TITLE = 'Định danh điện tử';

/** Khung camera dọc (cao/rộng) cho khuôn mặt. */
const FRAME_ASPECT = 1.2;

/** Lời nhắc lớn theo trạng thái; trong lúc quay là động tác của bước hiện tại. */
function promptOf(phase: LivenessPhase, steps: readonly LivenessStep[], stepIndex: number): { text: string; icon?: IconName } {
  switch (phase.kind) {
    case 'preparing':
      return { text: 'Đang chuẩn bị…' };
    case 'countdown':
      return { text: `Nhìn thẳng — bắt đầu sau ${phase.seconds}`, icon: 'scanFace' };
    case 'recording': {
      const step = steps[stepIndex];
      if (!step) return { text: ACTION_PROMPT.FRONTAL, icon: ACTION_ICON.FRONTAL };
      return { text: ACTION_PROMPT[step.action] ?? UNKNOWN_ACTION_PROMPT, icon: ACTION_ICON[step.action] };
    }
    case 'uploading':
      return { text: 'Đang kiểm tra…' };
    default:
      return { text: 'Giữ khuôn mặt trong khung', icon: 'scanFace' };
  }
}

/**
 * Kiểm tra khuôn mặt (liveness): quay video 8–10 giây bằng camera trước theo thử thách ngẫu
 * nhiên của server, rồi server so với ảnh chân dung trên thẻ.
 *
 * `CameraView` đặt `mode="video"` ngay từ lúc mở màn (Android chỉ gắn bộ ghi video ở chế độ này),
 * `mute` nên không cần quyền micro. Trong lúc quay/gửi thì khoá cử chỉ và nút quay lại để không
 * bỏ dở một lượt đã tính vào giới hạn của server. Không bao giờ cho chọn video có sẵn.
 */
export default function EkycLivenessScreen() {
  const nav = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const session = useEkycSession();
  const flow = useEkycFlow();
  const { phase, steps, stepIndex, start, recorder } = useLivenessSession({
    onReview: flow.showResult,
    onFinal: flow.showFinal,
  });
  const [mountError, setMountError] = useState<string | null>(null);

  // Đang quay hoặc đang gửi: rời màn lúc này làm hỏng một lượt đã tính vào giới hạn của server.
  // Lúc chuẩn bị/đếm ngược thì vẫn cho lùi — lượt đó tự huỷ khi màn bị gỡ.
  const locked = phase.kind === 'recording' || phase.kind === 'uploading';
  // Oval cao tối đa ~42% màn để lời nhắc và thanh tiến độ luôn nằm trong màn hình khi quay,
  // kể cả trên máy thấp — người dùng không thể vừa quay đầu vừa cuộn màn.
  const frameWidth = Math.round(
    Math.min(windowWidth - SCREEN_PADDING * 2, 320, (windowHeight * 0.42) / FRAME_ASPECT),
  );
  const frameHeight = Math.round(frameWidth * FRAME_ASPECT);

  // Tắt vuốt quay lại (iOS) và chặn nút back (Android) trong lúc khoá. Chỉ chặn thao tác lùi
  // của người dùng — các lệnh chuyển màn của chính luồng (reset khi có kết quả) vẫn đi qua.
  const { markNotReady } = recorder;
  useEffect(() => {
    nav.setOptions({ gestureEnabled: !locked });
    if (!locked) return undefined;
    return nav.addListener('beforeRemove', event => {
      const type = event.data.action.type;
      if (type === 'GO_BACK' || type === 'POP') event.preventDefault();
    });
  }, [locked, nav]);

  // Màn khác che lên thì gỡ camera trước để nhả thiết bị; quay lại thì phải chờ dựng lại.
  useEffect(() => {
    if (!isFocused) markNotReady();
  }, [isFocused, markNotReady]);

  if (!session.draftResult) {
    return (
      <Screen light>
        <PHeader title={SCREEN_TITLE} back />
        <InfoNote tone="warn">Cần chụp CCCD trước khi kiểm tra khuôn mặt.</InfoNote>
        <Button label="Chụp CCCD" icon="scan" onPress={flow.restartCapture} style={styles.action} />
      </Screen>
    );
  }

  const prompt = promptOf(phase, steps, stepIndex);
  const notice = phase.kind === 'intro' || phase.kind === 'preparing' ? phase.notice : null;

  return (
    <Screen light>
      <PHeader title={SCREEN_TITLE} back={!locked} />
      <FormStepProgress current={3} total={EKYC_STEP_TOTAL} label={EKYC_STEP_LABEL.liveness} />

      <CameraPermissionGate>
        {/* Lời nhắc đặt phía trên oval, gần camera trước: mắt nhìn chữ cũng là nhìn gần ống
            kính, giúp tư thế chính diện rõ hơn. */}
        {phase.kind === 'blocked' ? null : (
          <LivenessPrompt
            text={prompt.text}
            icon={prompt.icon}
            steps={steps}
            stepIndex={stepIndex}
            showProgress={phase.kind === 'recording'}
          />
        )}

        <FaceOvalFrame width={frameWidth} height={frameHeight} recording={phase.kind === 'recording'}>
          {isFocused && !mountError ? (
            <CameraView
              key={recorder.cameraKey}
              ref={recorder.cameraRef}
              style={StyleSheet.absoluteFill}
              facing="front"
              mode={recorder.mode === 'STILLS' ? 'picture' : 'video'}
              mute
              videoQuality={recorder.video.quality}
              videoBitrate={recorder.video.bitrate}
              animateShutter={false}
              onCameraReady={recorder.onCameraReady}
              onMountError={({ message }) => {
                console.warn('Không mở được camera trước:', message);
                setMountError('Không mở được camera trước. Đóng ứng dụng khác đang dùng camera rồi thử lại.');
              }}
            />
          ) : null}
        </FaceOvalFrame>
        {recorder.mode === 'STILLS' ? (
          <Text style={styles.mode}>Chế độ chụp ảnh liên tiếp</Text>
        ) : null}

        {phase.kind === 'blocked' ? (
          <>
            <InfoNote tone="warn" style={styles.notice}>
              {phase.message}
            </InfoNote>
            <Button
              label={phase.action === 'CONSENT' ? 'Đọc lại điều khoản' : 'Chụp lại CCCD'}
              icon={phase.action === 'CONSENT' ? 'fileText' : 'scan'}
              onPress={phase.action === 'CONSENT' ? flow.restartFromConsent : flow.restartCapture}
              style={styles.action}
            />
          </>
        ) : null}

        {notice ? (
          <InfoNote tone={notice.tone === 'info' ? 'info' : 'warn'} style={styles.notice}>
            {notice.text}
          </InfoNote>
        ) : null}
        {mountError ? (
          <InfoNote tone="warn" style={styles.notice}>
            {mountError}
          </InfoNote>
        ) : null}

        {phase.kind === 'preparing' || phase.kind === 'uploading' ? (
          <View style={styles.waiting} accessibilityLiveRegion="polite">
            <ActivityIndicator color={Colors.brand} />
            <Text style={styles.waitingText}>
              {phase.kind === 'uploading'
                ? 'Đang gửi và so khớp khuôn mặt, có thể mất tới một phút.'
                : 'Đang lấy yêu cầu động tác từ máy chủ.'}
            </Text>
          </View>
        ) : null}
        {phase.kind === 'recording' ? (
          <Text style={styles.waitingText}>Làm chậm, giữ yên khoảng 1 giây ở mỗi tư thế.</Text>
        ) : null}

        {phase.kind === 'intro' ? (
          <>
            <Button
              label={notice ? 'Thử lại' : 'Bắt đầu quay'}
              icon="scanFace"
              onPress={() => {
                setMountError(null);
                void start();
              }}
              style={styles.action}
            />
            <LivenessTips />
          </>
        ) : null}
      </CameraPermissionGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mode: { ...Text_.captionBold, color: Colors.ink2, textAlign: 'center', marginTop: Spacing.sm },
  notice: { marginTop: Spacing.lg },
  action: { marginTop: Spacing.xl },
  waiting: { alignItems: 'center', gap: Spacing.md, marginTop: Spacing.lg },
  waitingText: { ...Text_.micro, color: Colors.ink2, textAlign: 'center', marginTop: Spacing.sm },
});
