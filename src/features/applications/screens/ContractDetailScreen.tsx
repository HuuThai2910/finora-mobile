import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, Card, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { MIN_TOUCH, Spacing, Text_ } from '@/theme';
import ContractOverviewCard from '../components/ContractOverviewCard';
import InlineContractConsent from '../components/InlineContractConsent';
import ProcessTimeline from '../components/ProcessTimeline';
import PricingChangeNotice from '../components/PricingChangeNotice';
import { useContractDetail, type ContractDetailView } from '../hook/useContractDetail';
import { useContractPdf } from '../hook/useContractPdf';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ContractDetail'>;

/**
 * Một màn duy nhất cho toàn bộ bước đọc và consent: tóm tắt điều khoản, mở
 * thẳng PDF server rồi hiện ký/từ chối ngay bên dưới. Toàn văn không được dựng
 * lại bằng React Native để PDF đã xem và hash gửi khi ký luôn cùng một artifact.
 */
export default function ContractDetailScreen() {
  const { contractNumber } = useRoute<RouteProp<ProfileStackParamList, 'ContractDetail'>>().params;
  const state = useContractDetail(contractNumber);

  if (state.loading) {
    return (
      <Screen>
        <PHeader title="Hợp đồng vay" back />
        <LoadingScreen cards={4} />
      </Screen>
    );
  }

  if (state.loadError || !state.view) {
    return (
      <Screen>
        <PHeader title="Hợp đồng vay" back />
        <ErrorState
          message={state.loadError ?? 'Không tải được hợp đồng vay.'}
          onRetry={state.reload}
        />
      </Screen>
    );
  }

  return (
    <ContractDetailBody
      view={state.view}
      refreshing={state.refreshing}
      reload={state.reload}
    />
  );
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
  const {
    contract,
    pricingApplication,
    timeline,
    timelineFailed,
    countdown,
    canRespond,
    expiredWhileWaiting,
  } = view;
  const pdf = useContractPdf(contract);
  const [openedPdfHash, setOpenedPdfHash] = useState<string | null>(null);
  const currentPdfHash = contract.pdfDocument?.contentHash ?? null;
  const openedCurrentPdf = currentPdfHash !== null && openedPdfHash === currentPdfHash;
  const confirmed = ['SIGNED', 'EFFECTIVE', 'COMPLETED'].includes(contract.status);

  const openPdf = async () => {
    const opened = await pdf.openPdf();
    if (opened && currentPdfHash) setOpenedPdfHash(currentPdfHash);
  };

  const handleStale = () => {
    setOpenedPdfHash(null);
    reload();
  };

  return (
    <Screen onRefresh={reload} refreshing={refreshing}>
      <PHeader title="Hợp đồng vay" back />

      <ContractOverviewCard contract={contract} countdown={countdown} />

      {pricingApplication ? <PricingChangeNotice application={pricingApplication} /> : null}

      {expiredWhileWaiting ? (
        <InfoNote tone="warn" style={styles.note}>
          Hợp đồng đã quá hạn xác nhận nên không còn ký được. Hệ thống sẽ cập nhật trạng thái sang
          “Đã hết hạn”; nếu vẫn cần vay, bạn hãy nộp hồ sơ mới.
        </InfoNote>
      ) : null}

      <Card style={styles.documentCard}>
        <View style={styles.documentCopy}>
          <Text style={styles.documentEyebrow}>NỘI DUNG HỢP ĐỒNG</Text>
          <Text style={styles.documentTitle}>
            {confirmed ? 'Bản PDF xác nhận' : 'Hợp đồng và lịch trả nợ'}
          </Text>
          <Text style={styles.documentDescription}>
            Mở toàn văn PDF do Loan Service phát hành. Lịch từng kỳ và tổng nghĩa vụ chỉ nằm trong
            tài liệu này để tránh hiển thị lặp.
          </Text>
        </View>
        <Button
          label={confirmed ? 'Mở bản xác nhận PDF' : 'Mở nội dung hợp đồng PDF'}
          icon="file"
          onPress={openPdf}
          loading={pdf.opening}
          disabled={!contract.pdfDocument || pdf.sharing}
        />
        <Button
          label="Lưu hoặc chia sẻ PDF"
          icon="download"
          variant="outline"
          onPress={pdf.sharePdf}
          loading={pdf.sharing}
          disabled={!contract.pdfDocument || pdf.opening}
        />
      </Card>

      {pdf.error ? <InfoNote tone="warn" style={styles.note}>{pdf.error}</InfoNote> : null}

      {canRespond && !contract.pdfDocument ? (
        <InfoNote tone="warn" style={styles.note}>
          Hợp đồng cũ này chưa có PDF từ máy chủ nên chưa thể ký trên ứng dụng. Vui lòng liên hệ
          FINORA để được phát hành đúng tài liệu.
        </InfoNote>
      ) : null}

      {canRespond && contract.pdfDocument && !openedCurrentPdf ? (
        <InfoNote tone="info" style={styles.note}>
          Hãy mở và đọc bản PDF hiện hành. Khi quay lại ứng dụng, phần xác nhận sẽ xuất hiện ngay
          bên dưới mà không cần chuyển sang màn khác.
        </InfoNote>
      ) : null}

      {canRespond && openedCurrentPdf ? (
        <InlineContractConsent
          contract={contract}
          countdown={countdown}
          onDone={reload}
          onStale={handleStale}
        />
      ) : null}

      <Pressable
        onPress={() =>
          navigation.navigate('ApplicationDetail', {
            applicationNumber: contract.applicationNumber,
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Mở hồ sơ ${contract.applicationNumber}`}
        style={({ pressed }) => [styles.origin, pressed && styles.pressed]}
      >
        <Text style={styles.originText}>Lập từ hồ sơ {contract.applicationNumber}</Text>
      </Pressable>

      <ProcessTimeline title="LỊCH SỬ HỢP ĐỒNG" steps={timeline} failed={timelineFailed} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: Spacing.xl },
  documentCard: { gap: Spacing.lg, marginTop: Spacing.section },
  documentCopy: { gap: Spacing.xs },
  documentEyebrow: { ...Text_.captionBold, color: Colors.brand, letterSpacing: 0.6 },
  documentTitle: { ...Text_.title, color: Colors.ink },
  documentDescription: { ...Text_.micro, color: Colors.ink2 },
  origin: { justifyContent: 'center', minHeight: MIN_TOUCH, marginTop: Spacing.section },
  pressed: { opacity: 0.6 },
  originText: { ...Text_.micro, color: Colors.brand },
});
