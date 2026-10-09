import { useCallback, useRef } from 'react';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ApplicationDetailError } from '@/features/applications';
import type { ProfileStackParamList } from '@/navigation/types';
import LoanDetailSkeleton from '../components/LoanDetailSkeleton';
import LoanPaymentCard from '../components/LoanPaymentCard';
import LoanRestructureCard from '../components/LoanRestructureCard';
import LoanSummaryCard from '../components/LoanSummaryCard';
import ServicingScaffold from '../components/ServicingScaffold';
import { useServicingLoan } from '../hooks/useLoanServicing';
import { canPayLoan, canRescheduleLoan } from '../mappers/servicing';

type Route = RouteProp<ProfileStackParamList, 'LoanServicingDetail'>;
type Nav = NativeStackNavigationProp<ProfileStackParamList, 'LoanServicingDetail'>;

const TITLE = 'Chi tiết khoản vay';

/**
 * Chi tiết một khoản vay đang trả, cùng bộ với "Chi tiết hợp đồng" và sắp theo câu hỏi
 * của người vay: còn nợ bao nhiêu, kỳ này phải trả gì, rồi có thể cơ cấu không. Thanh
 * toán, trả trước, tất toán và cơ cấu đều mở màn riêng; màn này chỉ trình bày và dẫn lối.
 */
export default function LoanServicingDetailScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const nav = useNavigation<Nav>();
  const state = useServicingLoan(loanNumber);
  const focusedOnce = useRef(false);

  useFocusEffect(useCallback(() => {
    // useAsync đã tải ở lần mount; chỉ tải lại khi quay về từ màn thanh toán/cơ cấu.
    if (focusedOnce.current) state.reload();
    else focusedOnce.current = true;
  }, [state.reload]));

  if (state.loading && !state.data) {
    return (
      <ServicingScaffold title={TITLE}>
        <LoanDetailSkeleton label="Đang tải chi tiết khoản vay" />
      </ServicingScaffold>
    );
  }

  // Làm mới thất bại thì báo lỗi kèm nút thử lại thay vì để số liệu cũ trông như mới.
  if (state.error || !state.data) {
    return (
      <ServicingScaffold title={TITLE}>
        <ApplicationDetailError
          message={state.error ?? 'Không tải được khoản vay.'}
          retrying={state.loading}
          onRetry={state.reload}
        />
      </ServicingScaffold>
    );
  }

  const { loan, schedule } = state.data;

  return (
    <ServicingScaffold title={TITLE} onRefresh={state.reload} refreshing={state.loading}>
      <LoanSummaryCard
        loan={loan}
        periodCount={schedule.periods.length}
        onOpenSchedule={() => nav.navigate('ServicingSchedule', { loanNumber })}
      />
      {canPayLoan(loan) ? (
        <LoanPaymentCard
          loan={loan}
          onPay={() => nav.navigate('LoanPayment', { loanNumber })}
          onPrepay={() => nav.navigate('PartialPrepayment', { loanNumber })}
          onSettle={() => nav.navigate('EarlySettlement', { loanNumber })}
        />
      ) : null}
      {canRescheduleLoan(loan) ? (
        <LoanRestructureCard onOpen={() => nav.navigate('RescheduleLoan', { loanNumber })} />
      ) : null}
    </ServicingScaffold>
  );
}
