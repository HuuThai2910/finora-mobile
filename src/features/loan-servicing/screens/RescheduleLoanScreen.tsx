import { useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { ApplicationDetailError, DetailNote } from '@/features/applications';
import type { ProfileStackParamList } from '@/navigation/types';
import LoanDetailSkeleton from '../components/LoanDetailSkeleton';
import RescheduleActiveCard from '../components/RescheduleActiveCard';
import RescheduleForm from '../components/RescheduleForm';
import RescheduleHistoryCard from '../components/RescheduleHistoryCard';
import ServicingScaffold from '../components/ServicingScaffold';
import { useReschedule } from '../hooks/useReschedule';
import { canRescheduleLoan, isActiveReschedule, loanStatusLook } from '../mappers/servicing';
import type { RescheduleRequest } from '../types';

type Route = RouteProp<ProfileStackParamList, 'RescheduleLoan'>;

const TITLE = 'Cơ cấu khoản vay';

/**
 * Đề nghị cơ cấu hoặc gia hạn một khoản vay, cùng bộ thẻ với màn chi tiết. Khoản vay đang
 * có đề nghị chưa kết thúc thì hiện đề nghị đó thay cho biểu mẫu; không thì hiện biểu mẫu.
 * Đề nghị chỉ là yêu cầu: lịch trả chỉ đổi sau khi FINORA duyệt và lịch mới được áp dụng.
 */
export default function RescheduleLoanScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const nav = useNavigation();
  const query = useReschedule(loanNumber);
  const [created, setCreated] = useState<RescheduleRequest | null>(null);

  if (query.loading && !query.data) {
    return (
      <ServicingScaffold title={TITLE} subtitle={loanNumber}>
        <LoanDetailSkeleton label="Đang tải thông tin cơ cấu" />
      </ServicingScaffold>
    );
  }

  if (!query.data) {
    return (
      <ServicingScaffold title={TITLE} subtitle={loanNumber}>
        <ApplicationDetailError
          message={query.error ?? 'Không tải được điều khoản cơ cấu.'}
          retrying={query.loading}
          onRetry={query.reload}
        />
      </ServicingScaffold>
    );
  }

  const { policy, history, loan, periods } = query.data;
  // Vừa gửi mà lần tải lại chưa xong (hoặc lỗi) thì vẫn hiện đề nghị vừa tạo; tải lại xong
  // thì dùng bản trong lịch sử vì đó là trạng thái mới nhất.
  const createdInHistory = created ? history.some(item => item.requestId === created.requestId) : false;
  const active = history.find(item => isActiveReschedule(item.status)) ?? (created && !createdInHistory ? created : null);
  const past = history.filter(item => item.requestId !== active?.requestId);

  const submitted = (request: RescheduleRequest) => {
    setCreated(request);
    query.reload();
  };

  const renderMain = () => {
    if (active) {
      return (
        <RescheduleActiveCard
          request={active}
          justSubmitted={active.requestId === created?.requestId}
          onBack={() => nav.goBack()}
        />
      );
    }
    if (!canRescheduleLoan(loan)) {
      return (
        <DetailNote>
          {`Khoản vay đang ở trạng thái “${loanStatusLook(loan.status).label}” nên chưa nhận đề nghị cơ cấu mới.`}
        </DetailNote>
      );
    }
    return (
      <RescheduleForm
        // Điều khoản đổi phiên bản thì dựng lại biểu mẫu để ô xác nhận phải tích lại.
        key={policy.termsVersion}
        loanNumber={loanNumber}
        policy={policy}
        loan={loan}
        periods={periods}
        onSubmitted={submitted}
        onStale={query.reload}
      />
    );
  };

  return (
    <ServicingScaffold
      title={TITLE}
      subtitle={loanNumber}
      onRefresh={query.reload}
      refreshing={query.loading}
    >
      {query.error ? <DetailNote tone="warn">{`Chưa làm mới được: ${query.error}`}</DetailNote> : null}
      {renderMain()}
      {past.length > 0 ? <RescheduleHistoryCard requests={past} /> : null}
    </ServicingScaffold>
  );
}
