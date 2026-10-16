import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { PHeader, Screen } from '@/components/phone';
import { Button, Checkbox, InfoNote } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import type { ProfileStackParamList } from '@/navigation/types';
import ConsentMarkdown from '../components/ConsentMarkdown';
import { useEkycConsent } from '../hooks/useEkycConsent';
import { useEkycSession } from '../hooks/useEkycSession';
import { useScrolledToEnd } from '../hooks/useScrolledToEnd';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'EkycConsent'>;

const TITLE = 'Điều khoản eKYC';

/**
 * Điều khoản xử lý dữ liệu trước mọi màn camera (đề xuất mục 3.10).
 *
 * - Nội dung lấy từ server, không viết cứng trong app; đã đồng ý đúng phiên bản hiện hành thì
 *   chuyển thẳng sang chụp thẻ (`replace` để nút quay lại về Hồ sơ, không về màn này).
 * - Một ô tick duy nhất, mặc định chưa tick, chỉ bật khi đã cuộn tới cuối nội dung.
 * - "Để sau": người dùng vẫn dùng app nhưng chưa vay/đầu tư được.
 */
export default function EkycConsentScreen() {
  const nav = useNavigation<Nav>();
  const { reset, setConsentVersion } = useEkycSession();
  const { consent, accept } = useEkycConsent();
  const data = consent.data;
  const { reachedEnd, scrollProps } = useScrolledToEnd(data?.textSha256);
  const [checked, setChecked] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Đã đồng ý bản hiện hành: không hỏi lại, bắt đầu một phiên chụp mới.
  const acceptedVersion = data?.accepted ? data.version : null;
  useEffect(() => {
    if (!acceptedVersion) return;
    reset();
    setConsentVersion(acceptedVersion);
    nav.replace('EkycCapture', { side: 'front' });
  }, [acceptedVersion, nav, reset, setConsentVersion]);

  // Nội dung đổi (tải lại sau khi điều khoản vừa cập nhật) thì phải tick lại.
  useEffect(() => {
    setChecked(false);
  }, [data?.textSha256]);

  const onAccept = async () => {
    if (!data) return;
    setNotice(null);
    const outcome = await accept.submit(data);
    if (!outcome) return; // lỗi vận chuyển — `accept.error` đã giữ thông điệp
    if (outcome.kind === 'stale') {
      setNotice(outcome.message);
      consent.reload();
      return;
    }
    reset();
    setConsentVersion(outcome.consent.version);
    nav.replace('EkycCapture', { side: 'front' });
  };

  if (consent.error) {
    return (
      <Screen light>
        <PHeader title={TITLE} back />
        <ErrorState message={consent.error} onRetry={consent.reload} />
      </Screen>
    );
  }

  if (!data || data.accepted) {
    return (
      <Screen light>
        <PHeader title={TITLE} back />
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <ActivityIndicator color={Colors.brand} />
          <Text style={styles.loadingText}>Đang tải điều khoản…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen light scroll={false}>
      <PHeader title={TITLE} back />
      {notice ? (
        <InfoNote tone="warn" style={styles.notice}>
          {notice}
        </InfoNote>
      ) : null}

      <ScrollView style={styles.terms} contentContainerStyle={styles.termsContent} {...scrollProps}>
        <ConsentMarkdown body={data.body} />
      </ScrollView>

      <View style={styles.footer}>
        <Checkbox
          checked={checked}
          onChange={setChecked}
          label={data.consentLabel}
          disabled={!reachedEnd || accept.submitting}
        >
          <Text style={styles.consentLabel}>{data.consentLabel}</Text>
        </Checkbox>
        {!reachedEnd ? (
          <Text style={styles.hint}>Kéo xuống đọc hết điều khoản để đánh dấu đồng ý.</Text>
        ) : null}
        {accept.error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {accept.error}
          </Text>
        ) : null}

        <Button
          label="Bắt đầu xác minh"
          icon="shieldCheck"
          loading={accept.submitting}
          disabled={!checked || accept.submitting}
          onPress={() => void onAccept()}
          style={styles.primary}
        />
        <Button label="Để sau" variant="outline" disabled={accept.submitting} onPress={() => nav.goBack()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.page },
  loadingText: { ...Text_.micro, color: Colors.ink3 },
  notice: { marginBottom: Spacing.lg },
  terms: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.surfaceSubtle,
  },
  termsContent: { padding: Spacing.xl },
  footer: { paddingTop: Spacing.lg, gap: Spacing.sm },
  consentLabel: { ...Text_.microBold, color: Colors.ink },
  hint: { ...Text_.caption, color: Colors.ink3 },
  error: { ...Text_.micro, color: Colors.red },
  primary: { marginTop: Spacing.sm },
});
