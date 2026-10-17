import { StyleSheet, Text, View } from 'react-native';
import { PdfViewer } from '@/components/feedback';
import { PItem } from '@/components/phone';
import { Colors } from '@/constants/colors';
import { padesLegalNotice } from '@/constants/contractSignature';
import { useAuthenticatedPdf } from '@/hooks/useAuthenticatedPdf';
import { FontFamily } from '@/theme';
import type { LoanContractDetail } from '@/types/contract';
import { formatRecentTime } from '@/utils/format';
import DetailButton from './DetailButton';
import DetailCard from './DetailCard';
import DetailNote from './DetailNote';

/**
 * "Chữ ký số trong PDF" của hợp đồng ký PAdES (R5, W3C): số chữ ký đã nhúng vào chính tệp hợp đồng, bản đang ký
 * (`/signed-document`) khi các bên còn ký và "Trang biên nhận chữ ký" (`/receipt`) sau chữ ký cuối. Có trang biên nhận
 * nghĩa là đã đủ chữ ký: lúc đó `/document` ở thẻ nội dung đã là bản ký đủ nên không mời mở bản đang ký nữa.
 * Màn cha chỉ dựng thẻ này cho hợp đồng `PADES_B_B`; mọi số liệu lấy nguyên từ backend.
 */
export default function ContractSignaturesCard({ contract }: { contract: LoanContractDetail }) {
  const signed = contract.signedPdfDocument ?? null;
  const receipt = contract.receiptDocument ?? null;
  const count = signed?.signatureCount ?? 0;
  const inProgress = signed !== null && receipt === null;

  // Hai tệp có bearer token nên tải qua API client vào cache rồi mở nội bộ; khóa cache theo hash để bản mới không bị
  // che bởi bản cũ. Nút chỉ hiện khi backend đã trả đường dẫn tương ứng.
  const signedPdf = useAuthenticatedPdf({
    cacheKey: `${contract.contractNumber}:signed:${signed?.contentHash ?? 'none'}`,
    fileName: `${contract.contractNumber}-ban-dang-ky`,
    downloadPath: signed?.downloadPath ?? '',
  });
  const receiptPdf = useAuthenticatedPdf({
    cacheKey: `${contract.contractNumber}:receipt:${receipt?.contentHash ?? 'none'}`,
    fileName: `${contract.contractNumber}-bien-nhan-chu-ky`,
    downloadPath: receipt?.downloadPath ?? '',
  });
  const busy = signedPdf.opening || receiptPdf.opening;
  const pdfError = signedPdf.error ?? receiptPdf.error;

  return (
    <DetailCard title="Chữ ký số trong PDF" icon="shieldCheck">
      <View>
        <PItem label="Đã nhúng vào tệp" value={count > 0 ? `${count} chữ ký` : 'Chưa có chữ ký'} last={!signed} />
        {signed ? <PItem label="Lần ký gần nhất" value={formatRecentTime(signed.lastSignedAt)} last /> : null}
      </View>

      <Text style={styles.body}>
        {receipt
          ? 'Hợp đồng đã đủ chữ ký. Trang biên nhận liệt kê từng chữ ký: thứ tự, vai trò, thời điểm và chứng thư.'
          : 'Các bên cho vay ký lần lượt vào chính tệp PDF, bạn ký sau cùng. Bản đang ký chứa mọi chữ ký đã có.'}
      </Text>

      {inProgress && signed ? (
        <DetailButton
          label={`Bản đang ký (${count} chữ ký)`}
          icon="fileText"
          variant="row"
          onPress={() => void signedPdf.openPdf()}
          loading={signedPdf.opening}
          disabled={busy}
          accessibilityLabel={`Mở bản hợp đồng đang ký, có ${count} chữ ký`}
        />
      ) : null}
      {receipt ? (
        <DetailButton
          label="Trang biên nhận chữ ký"
          icon="receipt"
          variant="row"
          onPress={() => void receiptPdf.openPdf()}
          loading={receiptPdf.opening}
          disabled={busy}
        />
      ) : null}

      {pdfError ? <DetailNote tone="warn">{pdfError}</DetailNote> : null}
      <DetailNote tone="warn">{padesLegalNotice(contract.availableSignatureProvider)}</DetailNote>

      <PdfViewer
        visible={signedPdf.previewUri !== null}
        uri={signedPdf.previewUri}
        title={`Bản đang ký ${contract.contractNumber}`}
        onClose={signedPdf.closePreview}
        onShare={signedPdf.sharePdf}
        sharing={signedPdf.sharing}
      />
      <PdfViewer
        visible={receiptPdf.previewUri !== null}
        uri={receiptPdf.previewUri}
        title={`Biên nhận chữ ký ${contract.contractNumber}`}
        onClose={receiptPdf.closePreview}
        onShare={receiptPdf.sharePdf}
        sharing={receiptPdf.sharing}
      />
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
