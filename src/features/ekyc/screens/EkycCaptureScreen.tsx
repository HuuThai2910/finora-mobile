import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useIsFocused, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { FormStepProgress, Screen } from '@/components/phone';
import { Button, InfoNote } from '@/components/ui';
import type { ProfileStackParamList } from '@/navigation/types';
import { pickCardFromGallery } from '../capture/gallery';
import { cardCaptureSource } from '../capture/source';
import type { CardShot, CccdSide } from '../capture/types';
import QrReadBadge from '../components/QrReadBadge';
import {
  CAPTURE_SUB,
  CAPTURE_TITLE,
  CCCD_FRAME_HEIGHT,
  EKYC_STEP_LABEL,
  EKYC_STEP_TOTAL,
  RETAKE_GALLERY_AFTER,
} from '../constants/capture';
import { resultMessage } from '../constants/messages';
import { useEkycFlow } from '../hooks/useEkycFlow';
import { useEkycSession } from '../hooks/useEkycSession';
import { useEkycVerify } from '../hooks/useEkycVerify';
import { routeAfterVerify, toVerifyRequest } from '../mappers/result';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'EkycCapture'>;

const { CaptureView } = cardCaptureSource;

/**
 * Chụp một mặt CCCD — màn dùng chung cho cả hai mặt, phân biệt qua param `side`.
 *
 * Ảnh của mặt nằm trong EkycSession (nguồn sự thật duy nhất): chưa có thì hiện vùng chụp của
 * nguồn đang cấu hình, có rồi thì hiện ảnh xem lại "Chụp lại" / "Dùng ảnh này". Mặt sau xác nhận
 * thì gửi cả hai ảnh đi đọc thẻ và định tuyến theo `resultCode`:
 * `DRAFT_READY` → liveness; `RETAKE` → về đúng mặt bị lỗi kèm lý do; lỗi tạm thời → báo tại chỗ;
 * còn lại → màn kết quả.
 */
export default function EkycCaptureScreen() {
  const nav = useNavigation<Nav>();
  const side = useRoute<RouteProp<ProfileStackParamList, 'EkycCapture'>>().params?.side ?? 'front';
  const isFocused = useIsFocused();
  const session = useEkycSession();
  const flow = useEkycFlow();
  const verify = useEkycVerify();
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [galleryBusy, setGalleryBusy] = useState(false);

  const shot = session.shots[side];
  const otherSide = side === 'front' ? 'back' : 'front';
  const retake = session.retake[side];

  // Vào màn chụp mà phiên không còn phiên bản điều khoản (đã bị xoá) thì đọc lại điều khoản
  // từ đầu — request quét thẻ bắt buộc có `consentVersion`.
  const missingConsent = !session.consentVersion;
  useEffect(() => {
    if (missingConsent && isFocused) {
      nav.reset({ index: 1, routes: [{ name: 'Profile' }, { name: 'EkycConsent' }] });
    }
  }, [isFocused, missingConsent, nav]);

  const onCaptured = (next: CardShot) => {
    setInlineError(null);
    session.setShot(side, next);
  };

  const onPickGallery = async () => {
    setGalleryBusy(true);
    setInlineError(null);
    try {
      const picked = await pickCardFromGallery(!!session.shots[otherSide]?.qr);
      if (picked) onCaptured(picked);
    } catch (e) {
      console.warn('Chọn ảnh thẻ thất bại:', e instanceof Error ? e.message : 'lỗi không xác định');
      setInlineError('Không đọc được ảnh đã chọn, vui lòng chọn ảnh khác.');
    } finally {
      setGalleryBusy(false);
    }
  };

  const onSubmit = async () => {
    const { front, back } = session.shots;
    if (!front || !back || !session.consentVersion) return;
    setInlineError(null);

    const result = await verify.submit(toVerifyRequest(front, back, session.consentVersion));
    if (!result) return; // lỗi vận chuyển — `verify.error` đã giữ thông điệp

    switch (routeAfterVerify(result)) {
      case 'LIVENESS':
        session.setDraftResult(result);
        nav.navigate('EkycLiveness');
        return;
      case 'RETAKE': {
        const sides = session.applyRetake(result.retake, resultMessage('RETAKE', result.message));
        if (sides.includes('front')) nav.navigate('EkycCapture', { side: 'front' });
        return;
      }
      case 'RETRY_INLINE':
        setInlineError(resultMessage(result.resultCode, result.message));
        return;
      case 'CONSENT':
        flow.restartFromConsent();
        return;
      default:
        if (result.resultCode === 'VERIFIED' || result.resultCode === 'REVIEW_PENDING') flow.showFinal(result);
        else flow.showResult(result);
    }
  };

  const onConfirm = () => {
    if (side === 'front') nav.navigate('EkycCapture', { side: 'back' });
    else void onSubmit();
  };

  // Vào thẳng màn mặt sau mà chưa có ảnh mặt trước — đưa về đúng bước còn thiếu.
  if (side === 'back' && !session.shots.front) {
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

  const busy = verify.submitting || galleryBusy;
  const showGallery = !shot && retake.streak >= RETAKE_GALLERY_AFTER;

  return (
    <Screen light>
      <FormStepProgress
        current={side === 'front' ? 1 : 2}
        total={EKYC_STEP_TOTAL}
        label={EKYC_STEP_LABEL[side]}
      />
      <Text style={styles.title} accessibilityRole="header">
        {CAPTURE_TITLE[side]}
      </Text>
      <Text style={styles.sub}>{CAPTURE_SUB[side]}</Text>

      {retake.notice ? (
        <InfoNote tone="warn" style={styles.notice}>
          {`Cần chụp lại: ${retake.notice}`}
        </InfoNote>
      ) : null}

      {shot ? (
        <ShotPreview shot={shot} side={side} />
      ) : (
        <CaptureView
          side={side}
          active={isFocused}
          disabled={busy}
          otherSideHasQr={!!session.shots[otherSide]?.qr}
          onCaptured={onCaptured}
        />
      )}

      {inlineError ?? verify.error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {inlineError ?? verify.error}
        </Text>
      ) : null}

      {shot ? (
        <>
          <View style={styles.actions}>
            <Button
              label="Chụp lại"
              variant="outline"
              onPress={() => session.setShot(side, null)}
              disabled={busy}
              style={styles.grow}
            />
            <Button
              label={side === 'front' ? 'Dùng ảnh này' : 'Gửi xác minh'}
              icon="check"
              loading={verify.submitting}
              disabled={busy}
              onPress={onConfirm}
              style={styles.grow}
            />
          </View>
          {verify.submitting ? (
            <Text style={styles.waiting}>Đang đọc thông tin trên thẻ, có thể mất đến một phút…</Text>
          ) : null}
        </>
      ) : null}

      {showGallery ? (
        <View style={styles.gallery}>
          <Button
            label="Chọn ảnh có sẵn"
            variant="outline"
            icon="folder"
            loading={galleryBusy}
            disabled={busy}
            onPress={() => void onPickGallery()}
          />
          <Text style={styles.galleryHint}>
            Ảnh chọn từ thư viện sẽ được nhân viên FINORA duyệt thêm trước khi xác minh xong.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

/** Ảnh vừa chụp để người dùng tự soát trước khi dùng; hiện trọn ảnh, không cắt thêm. */
function ShotPreview({ shot, side }: { shot: CardShot; side: CccdSide }) {
  return (
    <View style={styles.preview}>
      <Image
        source={{ uri: shot.uri }}
        style={styles.fill}
        resizeMode="contain"
        accessibilityLabel={`Ảnh ${side === 'front' ? 'mặt trước' : 'mặt sau'} CCCD vừa chụp`}
      />
      {shot.qr ? <QrReadBadge style={styles.badge} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...Text_.heading, color: Colors.ink, textAlign: 'center', marginTop: Spacing.md },
  sub: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xs },
  missingHead: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.section },
  notice: { marginTop: Spacing.xl },
  preview: {
    height: CCCD_FRAME_HEIGHT,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { flex: 1 },
  badge: { position: 'absolute', top: Spacing.md, left: Spacing.md },
  actions: { flexDirection: 'row', gap: Spacing.lg },
  grow: { flex: 1 },
  action: { marginTop: Spacing.md },
  waiting: { ...Text_.micro, color: Colors.ink2, textAlign: 'center', marginTop: Spacing.md },
  error: { ...Text_.micro, color: Colors.red, textAlign: 'center', marginTop: Spacing.lg },
  gallery: { marginTop: Spacing.xl, gap: Spacing.sm },
  galleryHint: { ...Text_.caption, color: Colors.ink3, textAlign: 'center' },
});
