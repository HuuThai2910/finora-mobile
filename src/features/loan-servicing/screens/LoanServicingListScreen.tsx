import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Skeleton } from '@/components/feedback';
import { ApplicationFilterChips, ApplicationListStatus } from '@/features/applications';
import type { ProfileStackParamList } from '@/navigation/types';
import { Radius, Spacing } from '@/theme';
import LoanListCard from '../components/LoanListCard';
import LoanListSkeleton from '../components/LoanListSkeleton';
import PendingLoanActivationCard from '../components/PendingLoanActivationCard';
import ServicingScaffold from '../components/ServicingScaffold';
import { useLoanFilter } from '../hooks/useLoanFilter';
import { useServicingLoans } from '../hooks/useLoanServicing';
import { loanStatusLook } from '../mappers/servicing';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'LoanServicingList'>;

/** Đệm dọc của hàng chip (vùng chạm nới thêm), khớp `ApplicationFilterChips`. */
const CHIP_ROW_PAD = 5;
const CHIP_SKELETON_WIDTHS = [84, 118, 112] as const;
const ACTIVATION_POLL_INTERVAL_MS = 5_000;
const ACTIVATION_POLL_LIMIT = 24;

/**
 * Danh sách khoản vay đã giải ngân của người vay (Hồ sơ → Khoản vay), cùng bố cục màn
 * "Hợp đồng của tôi": đầu màn trên nền sóng, chip lọc theo trạng thái, mỗi khoản một thẻ.
 * Không trộn hồ sơ chờ duyệt hay hợp đồng chờ ký. Người vay thực tế có vài khoản (API trả
 * tối đa 50) nên vẽ bằng ScrollView để nền cuộn cùng thẻ.
 */
export default function LoanServicingListScreen() {
  const nav = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const state = useServicingLoans();
  const loans = state.data?.loans.data ?? [];
  const pending = state.data?.pending ?? [];
  const filter = useLoanFilter(loans);
  const poll = useRef({ key: '', count: 0 });
  const pollKey = pending.map(item => item.loanApplicationId).sort((a, b) => a - b).join(',');
  const hasAutoProgress = pending.some(item => item.status !== 'REPAIR_REQUIRED');

  // Tự cập nhật tối đa hai phút khi hệ thống đang hoàn tất khoản vay. Sau đó người dùng vẫn có thể kéo làm mới;
  // không polling vô hạn và không tự thử với hồ sơ đã cần nhân viên hỗ trợ.
  useEffect(() => {
    if (poll.current.key !== pollKey) poll.current = { key: pollKey, count: 0 };
    if (!isFocused || state.loading || state.error || !hasAutoProgress || poll.current.count >= ACTIVATION_POLL_LIMIT) return;
    const timer = setTimeout(() => {
      poll.current.count += 1;
      state.reload();
    }, ACTIVATION_POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [hasAutoProgress, isFocused, pollKey, state.error, state.loading, state.reload]);

  // Có lỗi thì báo lỗi kèm nút thử lại, kể cả khi còn dữ liệu cũ, thay vì lặng lẽ
  // hiện danh sách lỗi thời.
  const phase = state.loading && !state.data ? 'loading' : state.error ? 'error' : 'ready';

  const renderBody = () => {
    if (phase === 'loading') return <LoanListSkeleton />;
    if (phase === 'error') {
      return (
        <ApplicationListStatus
          kind="error"
          message={state.error ?? 'Không tải được danh sách khoản vay.'}
          retrying={state.loading}
          onRetry={state.reload}
        />
      );
    }
    if (loans.length === 0 && pending.length === 0) {
      return (
        <ApplicationListStatus
          kind="empty"
          title="Bạn chưa có khoản vay nào"
          hint="Khoản vay xuất hiện ở đây sau khi hợp đồng có hiệu lực và tiền đã giải ngân vào ví của bạn."
          action="Xem hợp đồng"
          onAction={() => nav.navigate('MyContracts')}
        />
      );
    }
    if (loans.length === 0) return null;
    if (filter.visible.length === 0 && filter.selected !== 'all') {
      return (
        <ApplicationListStatus
          kind="filtered"
          stageLabel={loanStatusLook(filter.selected).label}
          noun="khoản vay"
          onShowAll={() => filter.select('all')}
        />
      );
    }
    return filter.visible.map(loan => (
      <LoanListCard
        key={loan.loanNumber}
        loan={loan}
        onPress={() => nav.navigate('LoanServicingDetail', { loanNumber: loan.loanNumber })}
      />
    ));
  };

  return (
    <ServicingScaffold
      title="Khoản vay của tôi"
      headerSize="list"
      onRefresh={state.reload}
      // Lần tải đầu đã có khung giả; vòng xoay chỉ dành cho kéo làm mới.
      refreshing={state.loading && !!state.data}
    >
      {phase === 'ready' && loans.length > 0 ? (
        <ApplicationFilterChips chips={filter.chips} selected={filter.selected} onSelect={filter.select} noun="khoản vay" />
      ) : phase === 'loading' ? (
        // Giữ chỗ hàng chip lúc tải lần đầu để thẻ không bị đẩy xuống khi dữ liệu về.
        <View style={styles.chipSkeletons}>
          {CHIP_SKELETON_WIDTHS.map(width => (
            <Skeleton key={width} width={width} height={34} radius={Radius.pill} />
          ))}
        </View>
      ) : null}
      {phase === 'ready' && pending.length > 0 ? (
        <View style={styles.pendingList}>
          {pending.map(item => <PendingLoanActivationCard key={item.loanApplicationId} activation={item} />)}
        </View>
      ) : null}
      {renderBody()}
    </ServicingScaffold>
  );
}

const styles = StyleSheet.create({
  chipSkeletons: { flexDirection: 'row', gap: Spacing.md, paddingVertical: CHIP_ROW_PAD, overflow: 'hidden' },
  pendingList: { gap: Spacing.md },
});
