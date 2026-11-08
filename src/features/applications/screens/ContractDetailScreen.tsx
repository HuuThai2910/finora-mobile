import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/types';
import ApplicationDetailError from '../components/ApplicationDetailError';
import ApplicationDetailSkeleton from '../components/ApplicationDetailSkeleton';
import ApplicationTimelineCard from '../components/ApplicationTimelineCard';
import ContractDetailScaffold from '../components/ContractDetailScaffold';
import ContractDocumentCard from '../components/ContractDocumentCard';
import { PdfViewer } from '@/components/feedback';
import { SIGNATURE_REJECTED_MESSAGE } from '@/constants/contractSignature';
import ContractSignaturesCard from '../components/ContractSignaturesCard';
import ContractSmartCaCard from '../components/ContractSmartCaCard';
import ContractSummaryCard from '../components/ContractSummaryCard';
import ContractDisbursementCard from '../components/ContractDisbursementCard';
import DetailButton from '../components/DetailButton';
import DetailNote from '../components/DetailNote';
import InlineContractConsent from '../components/InlineContractConsent';
import { useContractDetail, type ContractDetailView } from '../hook/useContractDetail';
import { useContractPdf } from '../hook/useContractPdf';
import { useSmartCaSignature } from '../hook/useSmartCaSignature';
import { contractTimelineStop } from '../mappers/detailTimeline';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ContractDetail'>;

/** Hợp đồng đã được người vay xác nhận: PDF lúc này là bản xác nhận chứ không phải bản để đọc trước khi ký. */
const CONFIRMED_STATUSES = ['SIGNED', 'EFFECTIVE', 'COMPLETED'];

/**
 * Chi tiết hợp đồng (vẽ lại theo mockup 26/09/2026). Một màn duy nhất cho toàn
 * bộ bước đọc và consent: tóm tắt, kết quả điều khoản, mở thẳng PDF server rồi
 * hiện ký/từ chối ngay bên dưới. Toàn văn không dựng lại bằng React Native để PDF
 * đã xem và hash gửi khi ký luôn cùng một tài liệu.
 */
export default function ContractDetailScreen() {
  const { contractNumber } = useRoute<RouteProp<ProfileStackParamList, 'ContractDetail'>>().params;
  const state = useContractDetail(contractNumber);

  if (state.loading) {
    return (
      <ContractDetailScaffold>
        <ApplicationDetailSkeleton />
      </ContractDetailScaffold>
    );
  }

  if (state.loadError || !state.view) {
    return (
      <ContractDetailScaffold>
        <ApplicationDetailError
          message={state.loadError ?? 'Không tải được hợp đồng vay.'}
          retrying={state.refreshing}
          onRetry={state.reload}
        />
      </ContractDetailScaffold>
    );
  }

  return <ContractDetailBody view={state.view} refreshing={state.refreshing} reload={state.reload} />;
}

function ContractDetailBody({
  view,
  refreshing,
  reload,
}: {
  view: ContractDetailView;
  refreshing: boolean;
  reload: () => void;
}) {
  const navigation = useNavigation<Nav>();
  const { contract, timeline, timelineFailed, countdown, canRespond, canDecline, expiredWhileWaiting } =
    view;
  const pdf = useContractPdf(contract);
  const smartCa = useSmartCaSignature(contract.contractNumber, contract.status, reload);
  // Chỉ cho ký sau khi người vay đã mở đúng bản PDF hiện hành (so theo hash):
  // PDF được phát hành lại thì phải mở lại.
  const [openedPdfHash, setOpenedPdfHash] = useState<string | null>(null);
  const [showDecline, setShowDecline] = useState(false);
  const currentPdfHash = contract.pdfDocument?.contentHash ?? null;
  const openedCurrentPdf = currentPdfHash !== null && openedPdfHash === currentPdfHash;

  const openPdf = async () => {
    const opened = await pdf.openPdf();
    if (opened && currentPdfHash) setOpenedPdfHash(currentPdfHash);
  };

  const handleStale = () => {
    setOpenedPdfHash(null);
    reload();
  };

  return (
    <ContractDetailScaffold onRefresh={reload} refreshing={refreshing}>
      <ContractSummaryCard contract={contract} countdown={countdown} />

      {expiredWhileWaiting ? (
        <DetailNote tone="warn">
          Hợp đồng đã quá hạn xác nhận nên không còn ký được. Hệ thống sẽ cập
          nhật trạng thái sang “Đã hết hạn”; nếu vẫn cần vay, bạn hãy nộp hồ sơ
          mới.
        </DetailNote>
      ) : null}

      {contract.status === "SIGNING" ? (
        <ContractSmartCaCard
          checking={smartCa.checking}
          error={smartCa.error}
          onCheck={smartCa.check}
        />
      ) : null}

      {/* Thẻ SmartCA đã ẩn khi hợp đồng về chờ ký, nên lý do (chữ ký bị từ chối) hiện ở đây khi người vay còn ký được. */}
      {smartCa.rejected && canRespond ? (
        <DetailNote tone="warn">{SIGNATURE_REJECTED_MESSAGE}</DetailNote>
      ) : null}

      <ContractDocumentCard
        confirmed={CONFIRMED_STATUSES.includes(contract.status)}
        hasPdf={Boolean(contract.pdfDocument)}
        opening={pdf.opening}
        sharing={pdf.sharing}
        onOpen={openPdf}
        onShare={pdf.sharePdf}
        applicationNumber={contract.applicationNumber}
        onOpenApplication={() =>
          navigation.navigate("ApplicationDetail", {
            applicationNumber: contract.applicationNumber,
          })
        }
        mustRead={canRespond && Boolean(contract.pdfDocument) && !openedCurrentPdf}
      />

      {pdf.error ? <DetailNote tone="warn">{pdf.error}</DetailNote> : null}

      {canRespond && !contract.pdfDocument ? (
        <DetailNote tone="warn">
          Hợp đồng cũ này chưa có PDF từ máy chủ nên chưa thể ký trên ứng dụng.
          Vui lòng liên hệ FINORA để được phát hành đúng tài liệu.
        </DetailNote>
      ) : null}

      {canRespond && openedCurrentPdf ? (
        <InlineContractConsent
          contract={contract}
          countdown={countdown}
          signatureRejected={smartCa.rejected}
          onDone={reload}
          onStale={handleStale}
        />
      ) : null}

      {canDecline && !canRespond ? (
        showDecline ? (
          <InlineContractConsent
            contract={contract}
            countdown={countdown}
            declineOnly
            onCancelDecline={() => setShowDecline(false)}
            onDone={reload}
            onStale={handleStale}
          />
        ) : (
          <DetailButton
            label="Không tiếp tục khoản vay"
            variant="outline"
            icon="x"
            onPress={() => setShowDecline(true)}
          />
        )
      ) : null}

      <ContractDisbursementCard contract={contract} />

      {contract.signatureProfile === "PADES_B_B" ? (
        <ContractSignaturesCard contract={contract} />
      ) : null}

      <ApplicationTimelineCard
        title="Lịch sử hợp đồng"
        steps={timeline}
        stop={contractTimelineStop(contract.status)}
        failed={timelineFailed}
      />

      <PdfViewer
        visible={pdf.previewUri !== null}
        uri={pdf.previewUri}
        title={`Hợp đồng ${contract.contractNumber}`}
        onClose={pdf.closePreview}
        onShare={pdf.sharePdf}
        sharing={pdf.sharing}
      />
    </ContractDetailScaffold>
  );
}
