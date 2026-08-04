import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Icon, InfoNote, SegmentGroup, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong } from '@/utils/format';
import { toUserMessage } from '@/lib/api';
import type { SignatureMethod } from '@/types/invest';
import { SIGNATURE_METHODS, TRANSFER_LEGAL_NOTE } from '../constant';
import { useInvestmentContract } from '../hook/useInvestment';
import { signContract } from '../api';

/** Màn 29 — chi tiết hợp đồng đầu tư và ký số VNPT SmartCA. */
export default function InvestContractScreen() {
  const nav = useNavigation();
  const { data, loading, error, reload } = useInvestmentContract();
  const [method, setMethod] = useState<SignatureMethod>('APP_CONFIRM');
  const [submitting, setSubmitting] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  const onSign = async () => {
    setSubmitting(true);
    setSignError(null);
    try {
      await signContract();
      Alert.alert('Đã ký số', 'Hợp đồng được ghi lên sổ cái sau khi đủ chữ ký.', [
        { text: 'Xong', onPress: () => nav.goBack() },
      ]);
    } catch (e) {
      setSignError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Screen><LoadingScreen cards={2} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return null;

  return (
    <Screen>
      <PHeader title="Chi tiết hợp đồng đầu tư" back />

      <View style={styles.summary}>
        <View style={styles.summaryHead}>
          <Tag tone="amber" small>Chờ ký số</Tag>
          <Text style={styles.reference}>{data.reference}</Text>
        </View>
        <Text style={styles.purpose}>
          Mục đích: <Text style={styles.purposeStrong}>{data.purpose}</Text>
        </Text>
      </View>

      <PItem label="Vốn đầu tư" value={formatDong(data.amount)} />
      <PItem label="Số notes" value={String(data.noteCount)} />
      <PItem label="Kỳ hạn" value={`${data.termMonths} tháng`} last />

      <InfoNote tone="warn" style={styles.legal}>
        {TRANSFER_LEGAL_NOTE}
      </InfoNote>

      <View style={styles.sign}>
        <Text style={styles.signTitle} accessibilityRole="header">
          Ký số VNPT SmartCA
        </Text>

        <SegmentGroup
          label="Phương thức ký số"
          options={SIGNATURE_METHODS}
          value={method}
          onChange={setMethod}
          style={styles.methods}
        />

        {method === 'APP_CONFIRM' ? (
          <View style={styles.appConfirm}>
            <View style={styles.appIcon}>
              <Icon name="phone" size={IconSize.xl} color={Colors.brand} />
            </View>
            <Text style={styles.appText}>Xác nhận trên App SmartCA</Text>
            <Text style={styles.appHint}>
              Mở ứng dụng VNPT SmartCA trên điện thoại để duyệt yêu cầu ký.
            </Text>
          </View>
        ) : (
          <Text style={styles.appHint}>
            Nhập mật khẩu chứng thư số và mã OTP gửi tới số điện thoại đã đăng ký.
          </Text>
        )}

        {signError ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {signError}
          </Text>
        ) : null}

        <Button
          label="Ký hợp đồng"
          icon="pen"
          onPress={onSign}
          loading={submitting}
          style={styles.action}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  reference: { ...Text_.caption, fontFamily: 'monospace', color: Colors.ink3 },
  purpose: { ...Text_.body, color: Colors.ink },
  purposeStrong: { ...Text_.bodyBold, color: Colors.ink },
  legal: { marginTop: Spacing.xl },
  sign: {
    marginTop: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.card,
  },
  signTitle: { ...Text_.title, color: Colors.ink },
  methods: { marginVertical: Spacing.xl },
  appConfirm: { alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  appIcon: {
    width: 78,
    height: 78,
    borderRadius: Radius.pill,
    backgroundColor: Colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appText: { ...Text_.bodyBold, color: Colors.ink },
  appHint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center' },
  error: { ...Text_.micro, color: Colors.red, marginTop: Spacing.lg },
  action: { marginTop: Spacing.xl },
});
