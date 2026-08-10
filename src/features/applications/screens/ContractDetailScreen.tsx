import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { MIN_TOUCH, Spacing, Text_ } from '@/theme';
import { REPAYMENT_LABELS } from '../constant';
import { useContractDetail } from '../hook/useContractDetail';
import ContractDocumentSection from '../components/ContractDocumentSection';
import ContractStatusFact from '../components/ContractStatusFact';
import KeyTermsStrip from '../components/KeyTermsStrip';
import ProcessTimeline from '../components/ProcessTimeline';
import RepaymentSummary from '../components/RepaymentSummary';
import StatusBanner, { statusToneColor } from '../components/StatusBanner';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ContractDetail'>;

/**
 * Màn đọc hợp đồng. Đây là nơi để *hiểu* hợp đồng, việc ký hoặc từ chối nằm ở
 * `ContractConsentScreen`.
 *
 * Tách như vậy vì ở bản cũ nút ký nằm dưới toàn văn hợp đồng và toàn bộ lịch
 * trả, người dùng phải cuộn qua hàng chục kỳ mới thấy hành động chính. Nút vào
 * bước xác nhận giờ ghim ở đáy màn, luôn nhìn thấy trong lúc đọc.
 *
 * Màn chỉ nói mỗi con số đúng một lần: điều khoản ở dải ba số, toàn bộ phần
 * tiền ở khối lịch trả, còn các mốc chuyển trạng thái để dòng thời gian kể.
 */
export default function ContractDetailScreen() {
  const navigation = useNavigation<Nav>();
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

  const {
    contract,
    status,
    keyTerms,
    timeline,
    timelineFailed,
    countdown,
    canRespond,
    expiredWhileWaiting,
    periodCount,
  } = state.view;

  return (
    <Screen
      onRefresh={state.reload}
      refreshing={state.refreshing}
      footer={
        canRespond ? (
          <Button
            label="Đọc xong, sang bước ký"
            onPress={() => navigation.navigate('ContractConsent', { contractNumber })}
          />
        ) : undefined
      }
    >
      <PHeader title="Hợp đồng vay" back hint={contract.contractNumber} />

      <StatusBanner
        status={status}
        highlight={
          <ContractStatusFact
            contract={contract}
            countdown={countdown}
            color={statusToneColor(status.tone)}
            urgentColor={Colors.tagRedText}
          />
        }
      />

      {expiredWhileWaiting ? (
        <InfoNote tone="warn" style={styles.note}>
          Hợp đồng đã quá hạn xác nhận nên không còn ký được. Hệ thống sẽ cập nhật trạng thái sang
          “Đã hết hạn”; nếu vẫn cần vay, bạn hãy nộp hồ sơ mới.
        </InfoNote>
      ) : null}

      <KeyTermsStrip terms={keyTerms} />

      <RepaymentSummary
        firstInstallment={contract.firstInstallment}
        maximumInstallment={contract.maximumInstallment}
        repaymentLabel={REPAYMENT_LABELS[contract.repaymentMethod] ?? contract.repaymentMethod}
        principal={contract.principalAmount}
        interest={contract.totalInterest}
        fees={contract.totalFees}
        penalties={contract.totalPenalties}
        totalRepayment={contract.totalRepayment}
        expectedDisbursementDate={contract.expectedDisbursementDate}
        periodCount={periodCount}
        estimate={false}
        onOpenSchedule={() =>
          navigation.navigate('RepaymentSchedule', { source: 'contract', number: contractNumber })
        }
      />

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

      <ContractDocumentSection contract={contract} />

      <ProcessTimeline title="LỊCH SỬ HỢP ĐỒNG" steps={timeline} failed={timelineFailed} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: Spacing.xl },
  origin: { justifyContent: 'center', minHeight: MIN_TOUCH, marginTop: Spacing.sm },
  pressed: { opacity: 0.6 },
  originText: { ...Text_.micro, color: Colors.brand },
});
