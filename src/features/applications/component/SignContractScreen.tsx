import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, InfoNote, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong } from '@/utils/format';
import { toUserMessage } from '@/lib/api';
import { APPLY_STEPS, SIGN_AFTER_NOTE, SIGN_CHAIN_NOTE } from '../constant';
import { useLoanContract } from '../hook/useApplications';
import { signLoanContract } from '../api';

/** Màn 15 — ký hợp đồng số VNPT SmartCA, bước 3/3 (luồng A4.1). */
export default function SignContractScreen() {
  const nav = useNavigation();
  const { data, loading, error, reload } = useLoanContract();
  const [submitting, setSubmitting] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  const onSign = async () => {
    setSubmitting(true);
    setSignError(null);
    try {
      await signLoanContract();
      Alert.alert('Đã ký hợp đồng', SIGN_AFTER_NOTE, [
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
      <PHeader title="Ký hợp đồng" back hint={`bước 3/${APPLY_STEPS}`} />

      <View style={styles.doc}>
        <Text style={styles.docTitle}>HỢP ĐỒNG VAY SỐ {data.id}</Text>
        <Text style={styles.docLine}>
          Số tiền <Text style={styles.strong}>{formatDong(data.amount)}</Text> · kỳ hạn{' '}
          <Text style={styles.strong}>{data.termMonths} tháng</Text>
        </Text>
        <Text style={styles.docLine}>
          Lãi suất <Text style={styles.strong}>{data.annualRate}%/năm</Text> giảm dần ·{' '}
          {data.investorCount} nhà đầu tư
        </Text>
      </View>

      {data.signers.map((s, i) => (
        <PItem
          key={s.role}
          label={s.role}
          value={
            <Tag tone={s.status === 'SIGNED' ? 'green' : 'amber'} small>
              {s.status === 'SIGNED' ? '✓ Đã ký' : 'Chờ ký'}
            </Tag>
          }
          last={i === data.signers.length - 1}
        />
      ))}

      {signError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {signError}
        </Text>
      ) : null}

      <Button
        label="Ký bằng VNPT SmartCA"
        icon="pen"
        onPress={onSign}
        loading={submitting}
        style={styles.primary}
      />
      <Button label="Viettel CA" variant="outline" onPress={onSign} />

      <InfoNote tone="chain" style={styles.hash}>
        <Text style={styles.hashText}>
          SHA-256: {data.documentHash}
          {'\n'}→ {SIGN_CHAIN_NOTE}
        </Text>
      </InfoNote>

      <Text style={styles.note}>{SIGN_AFTER_NOTE}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  doc: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  docTitle: { ...Text_.bodyBold, color: Colors.ink },
  docLine: { ...Text_.micro, color: Colors.ink2 },
  strong: { ...Text_.microBold, color: Colors.ink },
  error: { ...Text_.micro, color: Colors.red, marginTop: Spacing.lg },
  primary: { marginTop: Spacing.xl, marginBottom: Spacing.lg },
  hash: { marginTop: Spacing.xl },
  hashText: { ...Text_.caption, fontFamily: 'monospace', color: Colors.tagVioletText },
  note: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
