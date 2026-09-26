import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/types';
import { REPAYMENT_LABELS } from '../constant';
import { useApplicationDetail } from '../hook/useApplicationDetail';
import { contractActionOf } from '../mappers/applicationSummary';
import ApplicationDetailError from '../components/ApplicationDetailError';
import ApplicationDetailScaffold from '../components/ApplicationDetailScaffold';
import ApplicationDetailSkeleton from '../components/ApplicationDetailSkeleton';
import ApplicationSummaryCard from '../components/ApplicationSummaryCard';
import ApplicationTimelineCard from '../components/ApplicationTimelineCard';
import DeclaredInfoSection from '../components/DeclaredInfoSection';
import PricingResultCard from '../components/PricingResultCard';
import RepaymentSummary from '../components/RepaymentSummary';
import TermsConfirmationSection from '../components/TermsConfirmationSection';
import WithdrawSection from '../components/WithdrawSection';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ApplicationDetail'>;

/**
 * Chi tiết hồ sơ vay (mockup 26/09/2026), sắp xếp theo đúng thứ tự câu hỏi của
 * người vay: hồ sơ đang ở đâu, kế tiếp là gì, mỗi kỳ phải trả bao nhiêu, đã đi
 * qua những mốc nào, rồi mới tới bản khai để tra cứu.
 *
 * Lịch trả ở đây là snapshot lúc nộp hồ sơ, không phải lịch vận hành sau giải
 * ngân, nên luôn đi kèm câu nói rõ đó là số nào và nằm ở màn riêng khi xem đầy đủ.
 */
export default function ApplicationDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { applicationNumber } = useRoute<RouteProp<ProfileStackParamList, 'ApplicationDetail'>>().params;
  const state = useApplicationDetail(applicationNumber);

  if (state.loading) {
    return (
      <ApplicationDetailScaffold applicationNumber={applicationNumber}>
        <ApplicationDetailSkeleton />
      </ApplicationDetailScaffold>
    );
  }

  if (state.loadError || !state.view) {
    return (
      <ApplicationDetailScaffold
        applicationNumber={applicationNumber}
        onRefresh={state.reload}
        refreshing={state.refreshing}
      >
        <ApplicationDetailError
          message={state.loadError ?? 'Không tải được chi tiết hồ sơ vay.'}
          retrying={state.refreshing}
          onRetry={state.reload}
        />
      </ApplicationDetailScaffold>
    );
  }

  const {
    application,
    displayedSchedule: snapshot,
    status,
    keyTerms,
    decision,
    timeline,
    timelineFailed,
    canWithdraw,
    periodCount,
    contract,
  } = state.view;
  const repaymentLabel =
    REPAYMENT_LABELS[application.productSnapshot.repaymentMethod] ??
    application.productSnapshot.repaymentMethod;
  const contractAction = contractActionOf(application, contract);

  return (
    <ApplicationDetailScaffold
      applicationNumber={application.applicationNumber}
      onRefresh={state.reload}
      refreshing={state.refreshing}
    >
      <ApplicationSummaryCard
        productName={application.productSnapshot.name}
        amount={application.requestedAmount}
        status={status}
        decision={decision}
        keyTerms={keyTerms}
        action={
          contractAction
            ? {
                label: contractAction.label,
                urgent: contractAction.urgent,
                onPress: () =>
                  contractAction.contractNumber
                    ? navigation.navigate('ContractDetail', {
                        contractNumber: contractAction.contractNumber,
                      })
                    : navigation.navigate('MyContracts'),
              }
            : null
        }
      />

      <PricingResultCard application={application} />

      <TermsConfirmationSection application={application} onDone={state.reload} />

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
        estimate={application.status !== 'APPROVED'}
        onOpenSchedule={() =>
          navigation.navigate('RepaymentSchedule', {
            source: 'application',
            number: application.applicationNumber,
          })
        }
      />

      <ApplicationTimelineCard steps={timeline} status={application.status} failed={timelineFailed} />

      <DeclaredInfoSection application={application} />

      {canWithdraw ? (
        <WithdrawSection
          onWithdraw={state.withdraw.submit}
          submitting={state.withdraw.submitting}
          error={state.withdraw.error}
          clearError={state.withdraw.clearError}
        />
      ) : null}
    </ApplicationDetailScaffold>
  );
}
