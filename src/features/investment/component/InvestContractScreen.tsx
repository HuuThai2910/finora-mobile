import { useRef, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PdfViewer, Skeleton } from '@/components/feedback';
import { WaveBackdrop } from '@/components/phone';
import { CONTRACTS_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import type { WalletStackParamList } from '@/navigation/types';
import { useAuthenticatedPdf } from '@/hooks/useAuthenticatedPdf';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import { openSmartCaApp, smartCaOpenFailureMessage } from '@/lib/smartCaApp';
import { usePinGuard } from '@/features/pin';
import { Radius, Spacing } from '@/theme';
import { declineInvestmentContract, signContract } from '../api';
import { CONTRACT_ART_BOTTOM, PORTFOLIO_MAX_WIDTH, PORTFOLIO_PADDING } from '../constant';
import { useInvestmentContract } from '../hook/useInvestment';
import { useInvestorSmartCa } from '../hook/useInvestorSmartCa';
import { toSignFailure } from '../signError';
import ContractSignedFilesCard from './ContractSignedFilesCard';
import ContractSignSteps from './ContractSignSteps';
import ContractSummaryCard from './ContractSummaryCard';
import ContractDeclineCard from './ContractDeclineCard';
import InvestHeader from './InvestHeader';
import InvestStatusCard from './InvestStatusCard';

/**
 * Màn 29 — ký hợp đồng đầu tư (vẽ lại theo bộ mockup): nền hai linh vật cầm hợp đồng của màn "Hợp
 * đồng của tôi", thẻ tóm tắt phần vốn, rồi hai bước đọc PDF và ký SmartCA.
 *
 * Luật ký giữ nguyên: chỉ ký được khi đã mở đúng bản PDF hiện hành và hợp đồng còn trong hạn chờ nhà
 * đầu tư; thử lại cùng một lần ký giữ nguyên idempotency key, ký xong mới tạo key mới.
 */
export default function InvestContractScreen() {
  const nav = useNavigation();
  const route = useRoute<RouteProp<WalletStackParamList, 'InvestContract'>>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, PORTFOLIO_MAX_WIDTH);
  const [viewportHeight, setViewportHeight] = useState(0);

  const { data, loading, error, reload } = useInvestmentContract(route.params?.contractNumber);
  const [submitting, setSubmitting] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [declining, setDeclining] = useState(false);
  const [declineError, setDeclineError] = useState<string | null>(null);
  // Lần ký vừa bị backend hủy (chữ ký không khớp chứng thư): nút bước 2 đổi thành "Ký lại".
  const [resign, setResign] = useState(false);
  const [openedPdfHash, setOpenedPdfHash] = useState<string | null>(null);
  // Retry cùng một thao tác ký phải giữ nguyên key; chỉ tạo key mới sau khi ký thành công hoặc khi backend đã hủy
  // hẳn lần ký (chữ ký bị từ chối).
  const signKey = useRef(generateIdempotencyKey());
  const declineKey = useRef(generateIdempotencyKey());
  const pdf = useAuthenticatedPdf({
    cacheKey: `${data?.reference ?? 'investment'}-${data?.pdfDocumentHash ?? 'pending'}`,
    fileName: data?.reference ?? 'investment-contract',
    downloadPath: data?.downloadPath ?? '/investor/loan-contracts/unavailable/document',
  });
  const smartCa = useInvestorSmartCa(data, reload);
  const { requirePin } = usePinGuard();

  const onSign = async () => {
    if (!data || submitting) return;
    setSubmitting(true);
    setSignError(null);
    try {
      // Hỏi PIN sau khi đã bấm ký; đóng bảng PIN là thôi ký, không báo lỗi.
      const pinToken = await requirePin('SIGN_CONTRACT', signKey.current);
      if (!pinToken) return;
      const result = await signContract(data, signKey.current, pinToken);
      signKey.current = generateIdempotencyKey();
      setResign(false);
      reload();
      if (result.status === 'SIGNING') {
        const openResult = await openSmartCaApp();
        const openFailure = smartCaOpenFailureMessage(openResult);
        Alert.alert(
          'Đã gửi yêu cầu SmartCA',
          openFailure
            ?? 'FINORA đã chuyển sang VNPT SmartCA. Sau khi xác nhận, hãy quay lại FINORA để kiểm tra kết quả.',
        );
      } else {
        Alert.alert('Đã ký hợp đồng', 'Chữ ký của bạn đã được ghi nhận trên đúng bản PDF hợp đồng.', [
          { text: 'Xong', onPress: () => nav.goBack() },
        ]);
      }
    } catch (e) {
      // 409 phiên ký của bên khác: giữ key, chờ người dùng bấm lại; 503 chữ ký bị từ chối: lần ký đã đóng nên key
      // mới, tải lại phần vốn (đã về chờ ký) và mời ký lại (D74).
      const failure = toSignFailure(e);
      setSignError(failure.message);
      if (failure.attemptClosed) {
        signKey.current = generateIdempotencyKey();
        setResign(true);
        reload();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onDecline = async (detail: string) => {
    if (!data || declining) return;
    setDeclining(true);
    setDeclineError(null);
    try {
      await declineInvestmentContract(data, declineKey.current, detail);
      declineKey.current = generateIdempotencyKey();
      Alert.alert(
        'Đã từ chối ký hợp đồng',
        'Đợt vay đã được hủy. Tiền đang giữ của các nhà đầu tư sẽ được trả về ví theo quy trình tự động.',
        [{ text: 'Đã hiểu', onPress: () => nav.goBack() }],
      );
      reload();
    } catch (error) {
      setDeclineError(toUserMessage(error));
      reload();
    } finally {
      setDeclining(false);
    }
  };

  const renderBody = () => {
    if (loading && !data) {
      return (
        <>
          <Skeleton height={300} radius={Radius.md} />
          <Skeleton height={220} radius={Radius.md} />
        </>
      );
    }
    if (error) {
      return (
        <InvestStatusCard
          icon="alert"
          danger
          title={error}
          hint="Kiểm tra kết nối mạng rồi thử lại."
          action={{ label: 'Thử lại', onPress: reload }}
        />
      );
    }
    if (!data) {
      return (
        <InvestStatusCard
          icon="file"
          title="Chưa có hợp đồng cần ký"
          hint="Hợp đồng xuất hiện ở đây khi một khoản vay bạn góp vốn đã gọi đủ vốn."
          action={{ label: 'Quay lại', onPress: () => nav.goBack() }}
        />
      );
    }

    const windowOpen = data.contractStatus === 'PENDING_LENDER_SIGNATURES'
      && new Date(data.expiresAt).getTime() > Date.now();
    const openPdf = async () => {
      if (await pdf.openPdf()) setOpenedPdfHash(data.pdfDocumentHash);
    };
    // Nhà đầu tư khác vừa rút: hợp đồng chờ gọi vốn bổ sung, chưa nhận chữ ký mới cho tới khi phát hành lại.
    const refunding = data.contractStatus === 'PENDING_REFUNDING';
    // Hợp đồng vẫn chạy (không bị người vay từ chối/hết hạn): phần vốn DECLINED/EXPIRED là của riêng nhà đầu tư này.
    const contractOpen = data.contractStatus !== 'DECLINED' && data.contractStatus !== 'EXPIRED';
    const terminal = data.status === 'SIGNED' || data.status === 'DECLINED' || data.status === 'EXPIRED' || refunding;
    const terminalCopy = data.status === 'SIGNED'
      ? {
          icon: 'shieldCheck' as const,
          title: 'Bạn đã ký phần vốn này',
          hint: data.contractStatus === 'EFFECTIVE'
            ? 'Hợp đồng đã đủ chữ ký và đang có hiệu lực.'
            : refunding
              ? 'Một nhà đầu tư khác đã rút trước khi ký. Chữ ký và phần vốn của bạn được giữ nguyên trong lúc khoản vay gọi vốn bổ sung.'
              : 'FINORA đang chờ các bên còn lại hoàn tất chữ ký.',
        }
      : data.status === 'DECLINED'
        ? contractOpen
          ? { icon: 'x' as const, title: 'Bạn đã rút khỏi hợp đồng', hint: 'Tiền giữ cho phần vốn này được trả về ví; khoản vay đang tìm nhà đầu tư thay thế.' }
          : { icon: 'x' as const, title: 'Hợp đồng đã dừng', hint: 'Phần vốn này không tiếp tục giải ngân.' }
        : data.status === 'EXPIRED'
          ? contractOpen
            ? { icon: 'clock' as const, title: 'Bạn chưa ký kịp', hint: 'Phần vốn đã rời hợp đồng và tiền giữ được trả về ví.' }
            : { icon: 'clock' as const, title: 'Đã hết hạn ký', hint: 'Hợp đồng này không còn nhận chữ ký mới.' }
          : {
              icon: 'users' as const,
              title: 'Đang gọi vốn bổ sung',
              hint: 'Một nhà đầu tư khác đã rút trước khi ký. Phần vốn của bạn được giữ; bạn sẽ được mời ký bản hợp đồng phát hành lại khi khoản vay gọi đủ vốn.',
            };

    return (
      <>
        <ContractSummaryCard contract={data} />
        {terminal ? (
          <InvestStatusCard
            icon={terminalCopy.icon}
            title={terminalCopy.title}
            hint={terminalCopy.hint}
            action={{ label: 'Xem hợp đồng PDF', onPress: () => void openPdf() }}
          />
        ) : (
          <ContractSignSteps
            pdfOpened={openedPdfHash === data.pdfDocumentHash}
            openingPdf={pdf.opening}
            onOpenPdf={() => void openPdf()}
            providerIsMock={data.availableSignatureProvider === 'MOCK'}
            signed={false}
            signing={data.status === 'SIGNING'}
            windowOpen={windowOpen}
            submitting={submitting}
            checking={smartCa.checking}
            resign={resign || smartCa.rejected}
            onSign={() => void onSign()}
            onOpenSmartCa={() => {
              void openSmartCaApp().then(result => {
                const message = smartCaOpenFailureMessage(result);
                if (message) Alert.alert('Không mở được SmartCA', message);
              });
            }}
            onCheck={() => void smartCa.check()}
            error={signError ?? smartCa.error ?? pdf.error}
          />
        )}
        {windowOpen && data.status !== 'SIGNED' && data.status !== 'DECLINED' && data.status !== 'EXPIRED' ? (
          <ContractDeclineCard declining={declining} error={declineError} onDecline={onDecline} />
        ) : null}
        {data.padesSigned ? <ContractSignedFilesCard contract={data} /> : null}
        <PdfViewer
          visible={pdf.previewUri !== null}
          uri={pdf.previewUri}
          title={`Hợp đồng ${data.reference}`}
          onClose={pdf.closePreview}
          onShare={pdf.sharePdf}
          sharing={pdf.sharing}
        />
      </>
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
      refreshControl={
        <RefreshControl
          refreshing={loading && !!data}
          onRefresh={reload}
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={CONTRACTS_WAVES} width={width} />
        <View style={styles.content}>
          <InvestHeader
            title={data?.status === 'PENDING_SIGNATURE' || data?.status === 'SIGNING'
              ? 'Ký hợp đồng đầu tư'
              : 'Chi tiết hợp đồng'}
            topInset={insets.top}
            minHeight={CONTRACT_ART_BOTTOM * (width / CONTRACTS_WAVES.width)}
          />
          {renderBody()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trơn của ảnh: phủ hai bên cột trên web rộng và lót lúc ảnh chưa nạp xong.
  root: { flex: 1, backgroundColor: Colors.contractsFill },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.xl, paddingHorizontal: PORTFOLIO_PADDING, paddingBottom: 40 },
});
