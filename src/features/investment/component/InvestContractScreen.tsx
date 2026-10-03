import { useRef, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PdfViewer, Skeleton } from '@/components/feedback';
import { WaveBackdrop } from '@/components/phone';
import { Icon } from '@/components/ui';
import { CONTRACTS_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { useAuthenticatedPdf } from '@/hooks/useAuthenticatedPdf';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import { FontFamily, Radius, Spacing } from '@/theme';
import { signContract } from '../api';
import { CONTRACT_ART_BOTTOM, CONTRACT_NOTE, PORTFOLIO_MAX_WIDTH, PORTFOLIO_PADDING } from '../constant';
import { useInvestmentContract } from '../hook/useInvestment';
import { useInvestorSmartCa } from '../hook/useInvestorSmartCa';
import ContractSignSteps from './ContractSignSteps';
import ContractSummaryCard from './ContractSummaryCard';
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
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, PORTFOLIO_MAX_WIDTH);
  const [viewportHeight, setViewportHeight] = useState(0);

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
    if (!data) return;
    setSubmitting(true);
    setSignError(null);
    try {
      const result = await signContract(data, signKey.current);
      signKey.current = generateIdempotencyKey();
      reload();
      if (result.status === 'SIGNING') {
        Alert.alert('Đã gửi yêu cầu SmartCA', 'Hãy mở ứng dụng VNPT SmartCA, xác nhận giao dịch rồi quay lại FINORA.');
      } else {
        Alert.alert('Đã ký hợp đồng', 'Chữ ký của bạn đã được ghi nhận trên đúng bản PDF hợp đồng.', [
          { text: 'Xong', onPress: () => nav.goBack() },
        ]);
      }
    } catch (e) {
      setSignError(toUserMessage(e));
    } finally {
      setSubmitting(false);
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

    return (
      <>
        <ContractSummaryCard contract={data} />
        <ContractSignSteps
          pdfOpened={openedPdfHash === data.pdfDocumentHash}
          openingPdf={pdf.opening}
          onOpenPdf={() => void openPdf()}
          providerIsMock={data.availableSignatureProvider === 'MOCK'}
          signed={data.status === 'SIGNED'}
          signing={data.status === 'SIGNING'}
          windowOpen={windowOpen}
          submitting={submitting}
          checking={smartCa.checking}
          onSign={() => void onSign()}
          onCheck={() => void smartCa.check()}
          error={signError ?? smartCa.error ?? pdf.error}
        />
        <View style={styles.note}>
          <Icon name="info" size={20} color={Colors.authPrimary} />
          <Text style={styles.noteText}>{CONTRACT_NOTE}</Text>
        </View>
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
            title="Ký hợp đồng đầu tư"
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
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.walletHistoryNote,
  },
  noteText: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
