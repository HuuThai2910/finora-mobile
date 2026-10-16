import { useState } from 'react';
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Button, Icon } from '@/components/ui';
import { CAPTURE_SUB, CCCD_FRAME_HEIGHT, SYSTEM_CAPTURE_TIPS } from '../constants/capture';
import { finalizeCardShot } from './cardImage';
import type { CaptureViewProps, CardCaptureSource } from './types';

const describe = (e: unknown): string => (e instanceof Error ? e.message : 'lỗi không xác định');

/**
 * Nguồn dự phòng: chụp bằng app Camera của máy (`launchCameraAsync`, có trong Expo Go) —
 * dùng khi màn chụp trong app vẫn mờ trên máy test. Trước khi mở camera hệ thống, màn này
 * đóng vai trò hướng dẫn chụp (đủ 4 góc, ~20 cm, tránh loá) vì camera hệ thống không vẽ
 * được khung ngắm của FINORA.
 *
 * Android mở bước cắt ảnh theo tỉ lệ thẻ 8:5; iOS không cắt (server tự tìm thẻ). Không có
 * quét QR sống — QR được dò trên ảnh đã chụp, server cũng tự giải lại.
 */
function SystemCaptureView({ side, disabled, otherSideHasQr, onCaptured }: CaptureViewProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  const openCamera = async () => {
    setBusy(true);
    setError(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setBlocked(!permission.canAskAgain);
        setError(
          permission.canAskAgain
            ? 'FINORA cần quyền camera để chụp CCCD.'
            : 'Bạn đã tắt quyền camera cho FINORA. Hãy bật lại trong Cài đặt.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: Platform.OS === 'android',
        aspect: [8, 5],
        exif: false,
      });
      const asset = result.canceled ? null : result.assets[0];
      if (!asset) return; // người dùng đóng camera — không phải lỗi

      const shot = await finalizeCardShot(
        { uri: asset.uri, width: asset.width, height: asset.height },
        { source: 'SYSTEM_CAMERA', liveQr: null, skipStillScan: otherSideHasQr },
      );
      onCaptured(shot);
    } catch (e) {
      console.warn('Chụp bằng camera hệ thống thất bại:', describe(e));
      setError('Không mở được camera hoặc không xử lý được ảnh, vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View>
      <View style={styles.guide} accessible accessibilityLabel={`Hướng dẫn chụp. ${CAPTURE_SUB[side]}`}>
        <View style={styles.card}>
          <Icon name="id" size={44} color={Colors.brand} />
          <Text style={styles.cardText}>{CAPTURE_SUB[side]}</Text>
        </View>
        <Corner style={styles.topLeft} />
        <Corner style={styles.topRight} />
        <Corner style={styles.bottomLeft} />
        <Corner style={styles.bottomRight} />
      </View>

      <View style={styles.tips}>
        {SYSTEM_CAPTURE_TIPS.map(tip => (
          <View key={tip} style={styles.tipRow}>
            <Icon name="check" size={16} color={Colors.emerald} strokeWidth={2.6} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {blocked ? (
        <Button label="Mở Cài đặt" icon="scan" onPress={() => void Linking.openSettings()} style={styles.action} />
      ) : (
        <Button
          label="Mở camera"
          icon="scan"
          loading={busy}
          disabled={busy || disabled}
          onPress={() => void openCamera()}
          style={styles.action}
        />
      )}
    </View>
  );
}

/** Góc khung minh hoạ "thấy đủ 4 góc thẻ". */
function Corner({ style }: { style: StyleProp<ViewStyle> }) {
  return <View style={[styles.corner, style]} pointerEvents="none" />;
}

export const systemCameraSource: CardCaptureSource = {
  kind: 'SYSTEM_CAMERA',
  CaptureView: SystemCaptureView,
};

const CORNER = 26;

const styles = StyleSheet.create({
  guide: {
    height: CCCD_FRAME_HEIGHT,
    marginTop: Spacing.xxl,
    padding: Spacing.xxl,
    borderRadius: Radius.xl,
    backgroundColor: Colors.brand50,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.brand100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  cardText: { ...Text_.micro, color: Colors.ink2, textAlign: 'center' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: Colors.brand },
  topLeft: { top: Spacing.md, left: Spacing.md, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  topRight: { top: Spacing.md, right: Spacing.md, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bottomLeft: {
    bottom: Spacing.md,
    left: Spacing.md,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: Spacing.md,
    right: Spacing.md,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  tips: { gap: Spacing.md, marginTop: Spacing.xl },
  tipRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  tipText: { ...Text_.micro, color: Colors.ink2, flex: 1 },
  error: { ...Text_.micro, color: Colors.red, textAlign: 'center', marginTop: Spacing.lg },
  action: { marginTop: Spacing.xl },
});
