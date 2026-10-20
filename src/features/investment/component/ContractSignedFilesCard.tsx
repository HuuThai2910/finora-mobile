import { StyleSheet, Text, View } from 'react-native';
import { PdfViewer } from '@/components/feedback';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { padesLegalNotice } from '@/constants/contractSignature';
import { useAuthenticatedPdf } from '@/hooks/useAuthenticatedPdf';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import type { InvestmentContract } from '@/types/invest';
import InvestButton from './InvestButton';

/**
 * "Chữ ký số trong PDF" của hợp đồng ký PAdES (R5, W3C) trên màn ký của nhà đầu tư: số chữ ký đã nhúng vào tệp, bản
 * đang ký (`/signed-document`) khi các bên còn ký và "Trang biên nhận chữ ký" (`/receipt`) sau chữ ký cuối. Có biên
 * nhận nghĩa là đã đủ chữ ký: lúc đó "Mở hợp đồng" ở bước 1 đã trả bản ký đủ nên không mời mở bản đang ký nữa. Màn
 * cha chỉ dựng thẻ này cho hợp đồng PAdES; mọi số liệu lấy nguyên từ backend.
 */
export default function ContractSignedFilesCard({ contract }: { contract: InvestmentContract }) {
  const count = contract.pdfSignatureCount;
  const receiptReady = contract.receiptDocumentHash !== null;
  const inProgress = contract.signedPdfDocumentHash !== null && !receiptReady;

  // Tải có bearer token vào cache rồi mở nội bộ; khóa cache theo hash để bản mới không bị che bởi bản cũ.
  const signedPdf = useAuthenticatedPdf({
    cacheKey: `${contract.reference}:signed:${contract.signedPdfDocumentHash ?? 'none'}`,
    fileName: `${contract.reference}-ban-dang-ky`,
    downloadPath: contract.signedDocumentPath,
  });
  const receiptPdf = useAuthenticatedPdf({
    cacheKey: `${contract.reference}:receipt:${contract.receiptDocumentHash ?? 'none'}`,
    fileName: `${contract.reference}-bien-nhan-chu-ky`,
    downloadPath: contract.receiptPath,
  });
  const busy = signedPdf.opening || receiptPdf.opening;
  const pdfError = signedPdf.error ?? receiptPdf.error;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Icon name="shieldCheck" size={20} color={Colors.authPrimary} />
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>Chữ ký số trong PDF</Text>
      </View>
      <Text style={styles.count} maxFontSizeMultiplier={1.4}>
        {count > 0 ? `${count} chữ ký đã nhúng vào tệp hợp đồng` : 'Tệp hợp đồng chưa có chữ ký số nào'}
      </Text>
      <Text style={styles.hint} maxFontSizeMultiplier={1.4}>
        {receiptReady
          ? 'Hợp đồng đã đủ chữ ký. Trang biên nhận liệt kê từng chữ ký: thứ tự, vai trò, thời điểm và chứng thư.'
          : 'Các nhà đầu tư ký lần lượt vào chính tệp PDF theo thứ tự hoàn tất, người vay ký sau cùng.'}
      </Text>

      {inProgress ? (
        <InvestButton
          label={`Bản đang ký (${count} chữ ký)`}
          icon="fileText"
          variant="outline"
          onPress={() => void signedPdf.openPdf()}
          loading={signedPdf.opening}
          disabled={busy}
        />
      ) : null}
      {receiptReady ? (
        <InvestButton
          label="Trang biên nhận chữ ký"
          icon="receipt"
          variant="outline"
          onPress={() => void receiptPdf.openPdf()}
          loading={receiptPdf.opening}
          disabled={busy}
        />
      ) : null}

      {pdfError ? (
        <View style={styles.error} accessibilityRole="alert">
          <Icon name="alert" size={18} color={Colors.tagRedText} />
          <Text style={styles.errorText}>{pdfError}</Text>
        </View>
      ) : null}
      <View style={styles.legal}>
        <Icon name="shieldAlert" size={18} color={Colors.tagAmberText} />
        <Text style={styles.legalText}>{padesLegalNotice(contract.availableSignatureProvider)}</Text>
      </View>

      <PdfViewer
        visible={signedPdf.previewUri !== null}
        uri={signedPdf.previewUri}
        title={`Bản đang ký ${contract.reference}`}
        onClose={signedPdf.closePreview}
        onShare={signedPdf.sharePdf}
        sharing={signedPdf.sharing}
      />
      <PdfViewer
        visible={receiptPdf.previewUri !== null}
        uri={receiptPdf.previewUri}
        title={`Biên nhận chữ ký ${contract.reference}`}
        onClose={receiptPdf.closePreview}
        onShare={receiptPdf.sharePdf}
        sharing={receiptPdf.sharing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  title: { flex: 1, fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk },
  count: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authInk },
  hint: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    backgroundColor: Colors.redBg,
  },
  errorText: { flex: 1, fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
  legal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    backgroundColor: Colors.amberBg,
  },
  legalText: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.tagAmberText },
});
