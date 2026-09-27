import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Icon, InfoNote, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen, PdfViewer } from '@/components/feedback';
import { formatDong } from '@/utils/format';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import { TRANSFER_LEGAL_NOTE } from '../constant';
import { useInvestmentContract } from '../hook/useInvestment';
import { useInvestorSmartCa } from '../hook/useInvestorSmartCa';
import { signContract } from '../api';
import { useAuthenticatedPdf } from '@/hooks/useAuthenticatedPdf';

/** Màn 29 — chi tiết hợp đồng đầu tư và ký số VNPT SmartCA. */
export default function InvestContractScreen() {
  const nav = useNavigation();
  const { data, loading, error, reload } = useInvestmentContract();
  const [submitting, setSubmitting] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [openedPdfHash, setOpenedPdfHash] = useState<string | null>(null);
  // Retry cùng một thao tác ký phải giữ nguyên key; chỉ tạo key mới sau khi ký thành công.
  const signKey = useRef(generateIdempotencyKey());
  const pdf = useAuthenticatedPdf({
    cacheKey: `${data?.reference ?? 'investment'}-${data?.pdfDocumentHash ?? 'pending'}`,
    fileName: data?.reference ?? 'investment-contract',
    downloadPath: data?.downloadPath ?? '/investor/loan-contracts/unavailable/document',
  });
  const smartCa = useInvestorSmartCa(data, reload);

  const onSign = async () => {
    setSubmitting(true);
    setSignError(null);
    try {
      if (!data) return;
      const result = await signContract(data, signKey.current);
      signKey.current = generateIdempotencyKey();
      reload();
      if (result.status === 'SIGNING') {
        Alert.alert(
          'Đã gửi yêu cầu SmartCA',
          'Hãy mở ứng dụng VNPT SmartCA, xác nhận giao dịch rồi quay lại FINORA.',
        );
      } else {
        Alert.alert('Đã xác nhận', 'Chữ ký của bạn đã được ghi nhận trên đúng PDF hợp đồng.', [
          { text: 'Xong', onPress: () => nav.goBack() },
        ]);
      }
    } catch (e) {
      setSignError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Screen><LoadingScreen cards={2} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return null;

  const providerIsMock = data.availableSignatureProvider === 'MOCK';
  const signingWithSmartCa = data.status === 'SIGNING';
  const openedCurrentPdf = openedPdfHash === data.pdfDocumentHash;
  const signatureWindowOpen = data.contractStatus === 'PENDING_LENDER_SIGNATURES'
    && new Date(data.expiresAt).getTime() > Date.now();

  const openPdf = async () => {
    if (await pdf.openPdf()) setOpenedPdfHash(data.pdfDocumentHash);
  };

  return (
    <Screen>
      <PHeader title="Chi tiết hợp đồng đầu tư" back />

      <View style={styles.summary}>
        <View style={styles.summaryHead}>
          <Tag tone={data.status === 'SIGNED' ? 'green' : 'amber'} small>
            {data.status === 'SIGNED'
              ? 'Đã ký'
              : signingWithSmartCa ? 'Đang xác nhận SmartCA' : 'Chờ ký'}
          </Tag>
          <Text style={styles.reference}>{data.reference}</Text>
        </View>
        <Text style={styles.purpose}>
          Mục đích: <Text style={styles.purposeStrong}>{data.purpose}</Text>
        </Text>
      </View>

      <PItem label="Vốn đầu tư" value={formatDong(data.amount)} />
      <PItem label="Số notes" value={String(data.noteCount)} />
      <PItem label="Kỳ hạn" value={`${data.termMonths} tháng`} />
      <PItem label="Chữ ký nhà đầu tư còn thiếu" value={String(data.remainingLenderSignatures)} last />

      <InfoNote tone="warn" style={styles.legal}>
        {TRANSFER_LEGAL_NOTE}
      </InfoNote>

      <View style={styles.sign}>
        <Text style={styles.signTitle}>PDF hợp đồng chung</Text>
        <Text style={styles.appHint}>
          Tất cả nhà đầu tư và người vay ký cùng một PDF/hash. Bạn cần đọc bản hiện hành trước khi xác nhận.
        </Text>
        <Button
          label="Mở nội dung hợp đồng PDF"
          icon="file"
          onPress={openPdf}
          loading={pdf.opening}
          disabled={pdf.opening}
          style={styles.action}
        />
      </View>

      <View style={styles.sign}>
        <Text style={styles.signTitle} accessibilityRole="header">
          {providerIsMock ? 'Xác nhận thử nghiệm' : 'Ký số VNPT SmartCA'}
        </Text>

        {!providerIsMock ? (
          <View style={styles.appConfirm}>
            <View style={styles.appIcon}>
              <Icon name="phone" size={IconSize.xl} color={Colors.brand} />
            </View>
            <Text style={styles.appText}>
              {signingWithSmartCa ? 'Đang chờ xác nhận trên SmartCA' : 'Xác nhận bằng VNPT SmartCA'}
            </Text>
            <Text style={styles.appHint}>
              {signingWithSmartCa
                ? 'Mở ứng dụng VNPT SmartCA, xác nhận giao dịch rồi quay lại FINORA để kiểm tra kết quả.'
                : 'FINORA sẽ gửi giao dịch tới tài khoản SmartCA test đang được cấu hình.'}
            </Text>
          </View>
        ) : (
          <Text style={styles.appHint}>
            Provider MOCK chỉ phục vụ phát triển và không thay thế chữ ký số hợp pháp.
          </Text>
        )}

        {signError ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {signError}
          </Text>
        ) : null}

        {smartCa.error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {smartCa.error}
          </Text>
        ) : null}

        {signingWithSmartCa ? (
          <Button
            label="Tôi đã xác nhận, kiểm tra kết quả"
            icon="check"
            onPress={smartCa.check}
            loading={smartCa.checking}
            disabled={smartCa.checking}
            style={styles.action}
          />
        ) : (
          <Button
            label={providerIsMock ? 'Xác nhận hợp đồng (mock)' : 'Gửi yêu cầu ký SmartCA'}
            icon="pen"
            onPress={onSign}
            loading={submitting}
            disabled={submitting || data.status === 'SIGNED'
              || !signatureWindowOpen || !openedCurrentPdf}
            style={styles.action}
          />
        )}
      </View>

      {pdf.error ? <InfoNote tone="warn" style={styles.legal}>{pdf.error}</InfoNote> : null}
      <PdfViewer
        visible={pdf.previewUri !== null}
        uri={pdf.previewUri}
        title={`Hợp đồng ${data.reference}`}
        onClose={pdf.closePreview}
        onShare={pdf.sharePdf}
        sharing={pdf.sharing}
      />
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
