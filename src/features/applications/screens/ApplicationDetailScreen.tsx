import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import { REPAYMENT_LABELS } from '../constant';
import { useApplicationDetail } from '../hook/useApplicationDetail';
import DeclaredInfoSection from '../components/DeclaredInfoSection';
import KeyTermsStrip from '../components/KeyTermsStrip';
import ProcessTimeline from '../components/ProcessTimeline';
import RepaymentSummary from '../components/RepaymentSummary';
import StatusBanner from '../components/StatusBanner';
import WithdrawSection from '../components/WithdrawSection';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ApplicationDetail'>;

/**
 * Chi tiết hồ sơ vay, sắp xếp theo đúng thứ tự câu hỏi của người vay:
 * hồ sơ đang ở đâu, kế tiếp là gì, mỗi kỳ phải trả bao nhiêu, đã đi qua những
 * mốc nào, rồi mới tới bản khai để tra cứu.
 *
 * Lịch trả ở đây là snapshot lúc nộp hồ sơ, không phải lịch vận hành sau giải
 * ngân, nên luôn đi kèm cảnh báo và nằm ở màn riêng khi xem đầy đủ.
 */
export default function ApplicationDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { applicationNumber } = useRoute<RouteProp<ProfileStackParamList, 'ApplicationDetail'>>().params;
  const state = useApplicationDetail(applicationNumber);

  if (state.loading) {
    return (
      <Screen>
        <PHeader title="Hồ sơ vay" back />
        <LoadingScreen cards={4} />
      </Screen>
    );
  }

  if (state.loadError || !state.view) {
    return (
      <Screen>
        <PHeader title="Hồ sơ vay" back />
        <ErrorState
          message={state.loadError ?? 'Không tải được chi tiết hồ sơ vay.'}
          onRetry={state.reload}
        />
      </Screen>
    );
  }

  const { application, status, keyTerms, timeline, timelineFailed, canWithdraw, periodCount, contractNumber } =
    state.view;
  const snapshot = application.calculationSnapshot;
  const repaymentLabel =
    REPAYMENT_LABELS[application.productSnapshot.repaymentMethod] ??
    application.productSnapshot.repaymentMethod;

  return (
    <Screen onRefresh={state.reload} refreshing={state.refreshing}>
      <PHeader title="Hồ sơ vay" back hint={application.applicationNumber} />

      <StatusBanner
        status={status}
        action={
          application.status === 'APPROVED' ? (
            <Button
              label="Xem hợp đồng chờ ký"
              onPress={() =>
                contractNumber
                  ? navigation.navigate('ContractDetail', { contractNumber })
                  : navigation.navigate('MyContracts')
              }
            />
          ) : null
        }
      />

      <KeyTermsStrip terms={keyTerms} />

      <RepaymentSummary
        firstInstallment={snapshot.firstInstallment}
        maximumInstallment={snapshot.maximumInstallment}
        repaymentLabel={repaymentLabel}
        principal={snapshot.totalPrincipal}
        interest={snapshot.totalInterest}
        fees={snapshot.totalFees}
        penalties={snapshot.totalPenalties}
        totalRepayment={snapshot.totalRepayment}
        expectedDisbursementDate={snapshot.expectedDisbursementDate}
        periodCount={periodCount}
        estimate
        onOpenSchedule={() =>
          navigation.navigate('RepaymentSchedule', {
            source: 'application',
            number: application.applicationNumber,
          })
        }
      />

      <InfoNote tone="info" style={styles.note}>
        Đây là số dự kiến tính lúc bạn nộp hồ sơ. Lịch trả chính thức chỉ hình thành sau khi hợp đồng
        có hiệu lực và khoản vay được giải ngân.
      </InfoNote>

      <ProcessTimeline title="TIẾN TRÌNH XỬ LÝ" steps={timeline} failed={timelineFailed} />

      <View style={styles.declared}>
        <Text style={styles.declaredTitle}>Thông tin bạn đã gửi</Text>
        <Text style={styles.declaredHint}>
          Bản chụp tại thời điểm nộp hồ sơ. Nội dung này không thay đổi khi bạn cập nhật hồ sơ cá nhân.
        </Text>
      </View>
      <DeclaredInfoSection application={application} />

      {canWithdraw ? (
        <WithdrawSection
          onWithdraw={state.withdraw.submit}
          submitting={state.withdraw.submitting}
          error={state.withdraw.error}
          clearError={state.withdraw.clearError}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: Spacing.lg },
  declared: { marginTop: Spacing.section, gap: Spacing.xs },
  declaredTitle: { ...Text_.title, color: Colors.ink },
  declaredHint: { ...Text_.micro, color: Colors.ink3 },
});
