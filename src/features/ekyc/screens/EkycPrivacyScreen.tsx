import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { PHeader, Screen } from '@/components/phone';
import { Button, Card, InfoNote, Tag, type TagTone } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { KYC_LABEL } from '@/features/account';
import { useAuth } from '@/providers/AuthProvider';
import type { EkycConsent } from '@/types/ekyc';
import { formatDateTime } from '@/utils/format';
import ConsentMarkdown from '../components/ConsentMarkdown';
import { useEkycPrivacy } from '../hooks/useEkycPrivacy';

const WITHDRAW_TITLE = 'Rút lại đồng ý?';
const WITHDRAW_BODY =
  'FINORA sẽ xoá ảnh thẻ, video khuôn mặt và kết quả xác minh của bạn. Tài khoản trở về trạng thái ' +
  'chưa xác minh nên bạn tạm thời không vay hoặc đầu tư được cho tới khi xác minh lại.';

type ConsentLook = { label: string; tone: TagTone };

function consentLook(consent: EkycConsent): ConsentLook {
  if (consent.accepted) return { label: 'Đang đồng ý', tone: 'green' };
  if (consent.acceptedAt) return { label: 'Đồng ý cũ không còn hiệu lực', tone: 'amber' };
  return { label: 'Chưa đồng ý', tone: 'gray' };
}

/**
 * Cài đặt › Quyền riêng tư eKYC: xem trạng thái đồng ý, đọc lại điều khoản, rút lại đồng ý.
 *
 * Nút rút lại hiện khi còn bản đồng ý (kể cả bản cũ) hoặc hồ sơ đang/đã xác minh — đó là lúc
 * server còn giữ bằng chứng để xoá. Luôn hỏi xác nhận trước vì rút lại làm mất trạng thái
 * định danh. Số định danh vẫn được giữ ở dạng mã hoá để một CCCD chỉ gắn một tài khoản.
 */
export default function EkycPrivacyScreen() {
  const privacy = useEkycPrivacy();
  const kycStatus = useAuth().session?.profile.kycStatus;
  const [showTerms, setShowTerms] = useState(false);
  const consent = privacy.consent;

  const askWithdraw = () =>
    Alert.alert(WITHDRAW_TITLE, WITHDRAW_BODY, [
      { text: 'Giữ đồng ý', style: 'cancel' },
      { text: 'Rút lại', style: 'destructive', onPress: () => void privacy.withdraw() },
    ]);

  let body: React.ReactNode;
  if (privacy.error && !consent) {
    body = <ErrorState message={privacy.error} onRetry={privacy.reload} />;
  } else if (!consent) {
    body = <LoadingScreen cards={1} />;
  } else {
    const look = consentLook(consent);
    const canWithdraw =
      consent.accepted || consent.acceptedAt !== null || kycStatus === 'KYC_VERIFIED' || kycStatus === 'PENDING_REVIEW';

    body = (
      <>
        <Card style={styles.card}>
          <Text style={styles.cardTitle} accessibilityRole="header">
            Trạng thái đồng ý
          </Text>
          <Tag tone={look.tone}>{look.label}</Tag>
          <InfoRow label="Phiên bản điều khoản hiện hành" value={consent.version} />
          {consent.acceptedAt ? <InfoRow label="Đồng ý lúc" value={formatDateTime(consent.acceptedAt)} /> : null}
          {kycStatus ? <InfoRow label="Trạng thái định danh" value={KYC_LABEL[kycStatus]} /> : null}
        </Card>

        <InfoNote style={styles.note}>
          Rút lại đồng ý sẽ xoá ảnh thẻ, video và kết quả xác minh (trừ phần pháp luật bắt buộc lưu), tài khoản trở
          về chưa xác minh. Số định danh vẫn được giữ ở dạng mã hoá để mỗi CCCD chỉ gắn với một tài khoản.
        </InfoNote>

        <Button
          label={showTerms ? 'Ẩn điều khoản' : 'Xem điều khoản'}
          variant="outline"
          icon="fileText"
          onPress={() => setShowTerms(v => !v)}
          style={styles.action}
        />
        {showTerms ? (
          <View style={styles.terms}>
            <ConsentMarkdown body={consent.body} />
          </View>
        ) : null}

        {privacy.done ? (
          <InfoNote tone="success" style={styles.note}>
            {privacy.done}
          </InfoNote>
        ) : null}
        {privacy.withdrawError ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {privacy.withdrawError}
          </Text>
        ) : null}

        {canWithdraw ? (
          <Button
            label="Rút lại đồng ý"
            variant="danger"
            loading={privacy.withdrawing}
            disabled={privacy.withdrawing}
            onPress={askWithdraw}
            style={styles.action}
          />
        ) : null}
      </>
    );
  }

  return (
    <Screen light onRefresh={privacy.reload} refreshing={privacy.loading && !!consent}>
      <PHeader title="Quyền riêng tư eKYC" back />
      {body}
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  cardTitle: { ...Text_.bodyBold, color: Colors.ink },
  row: { gap: Spacing.xxs },
  rowLabel: { ...Text_.caption, color: Colors.ink3 },
  rowValue: { ...Text_.microBold, color: Colors.ink },
  note: { marginTop: Spacing.lg },
  action: { marginTop: Spacing.lg },
  terms: {
    marginTop: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.surfaceSubtle,
  },
  error: { ...Text_.micro, color: Colors.red, marginTop: Spacing.lg },
});
