import { StyleSheet, Text, View } from 'react-native';
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { REPAYMENT_METHOD_LABEL } from '@/features/products';
import type { MarketStackParamList, TabParamList } from '@/navigation/types';
import { useAuth } from '@/providers/AuthProvider';
import { FontFamily, Radius, Spacing } from '@/theme';
import type { InvestOrderResult, MarketLoan } from '@/types/invest';
import { formatDong } from '@/utils/format';
import { INVEST_BLOCK_COPY } from '../constant';
import { useInvestForm } from '../hook/useInvestForm';
import { useMarketLoan } from '../hook/useMarket';
import { fundingState, investBlock } from '../investRules';
import BorrowerSummaryCard from './BorrowerSummaryCard';
import FundingProgressCard from './FundingProgressCard';
import InvestAmountField from './InvestAmountField';
import InvestBar from './InvestBar';
import InvestEstimateCard from './InvestEstimateCard';
import LoanDetailFrame from './LoanDetailFrame';
import LoanHeroCard from './LoanHeroCard';
import LoanStatusCard from './LoanStatusCard';
import LoanTermsCard from './LoanTermsCard';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<MarketStackParamList, 'LoanDetail'>,
  BottomTabNavigationProp<TabParamList>
>;
type Route = RouteProp<MarketStackParamList, 'LoanDetail'>;

const titleOf = (listingId: string) => `Khoản vay #${listingId}`;

/**
 * Màn 19 — chi tiết khoản vay trên sàn và góp vốn, vẽ lại cùng bộ với sổ lệnh chợ Notes: nền sóng
 * trang chủ, thẻ đầu có robot, tiến độ gọi vốn, thông tin khoản vay, ô số tiền theo đúng luật
 * backend, số tạm tính và nút đặt lệnh ghim đáy. Đặt lệnh xong thì thay nội dung bằng kết quả.
 */
export default function LoanDetailScreen() {
  const { loanId } = useRoute<Route>().params;
  const loan = useMarketLoan(loanId);

  // Có lỗi thì báo lỗi kèm thử lại, kể cả khi còn bản cũ: không để đặt lệnh trên số liệu đã cũ.
  if (loan.data && !loan.error) {
    return <LoanInvest loan={loan.data} refreshing={loan.loading} onRefresh={loan.reload} />;
  }
  return (
    <LoanDetailFrame title={titleOf(loanId)}>
      {loan.error ? (
        <LoanStatusCard
          icon="alert"
          danger
          title={loan.error}
          message="Kiểm tra kết nối mạng rồi thử lại."
          primary={{ label: 'Thử lại', onPress: loan.reload }}
        />
      ) : (
        <View style={styles.skeleton} accessibilityLabel="Đang tải khoản vay">
          <Skeleton height={176} radius={16} />
          <Skeleton height={150} radius={Radius.md} />
          <Skeleton height={124} radius={Radius.md} />
        </View>
      )}
    </LoanDetailFrame>
  );
}

type InvestProps = { loan: MarketLoan; refreshing: boolean; onRefresh: () => void };

function LoanInvest({ loan, refreshing, onRefresh }: InvestProps) {
  const nav = useNavigation<Nav>();
  const { session } = useAuth();
  const form = useInvestForm(loan);
  const state = fundingState(loan);
  // Loan chỉ trả hồ sơ người vay cho tài khoản nhà đầu tư; vai trò khác không gọi để khỏi nhận 403.
  const applicationNumber = session?.profile.role === 'INVESTOR' ? loan.applicationNumber : null;
  const block = investBlock(state, form.bounds);
  const title = titleOf(loan.id);
  const toMarket = () => nav.navigate('Market');

  if (form.result) {
    const actions: Record<ResultAction, { label: string; onPress: () => void }> = {
      portfolio: { label: 'Xem danh mục đầu tư', onPress: () => nav.navigate('Ví', { screen: 'Portfolio' }) },
      topUp: { label: 'Nạp tiền vào ví', onPress: () => nav.navigate('Ví', { screen: 'TopUp' }) },
      // Đặt lại trên số liệu mới: phần còn thiếu có thể đã đổi trong lúc lệnh bị từ chối.
      retry: { label: 'Chọn số tiền khác', onPress: () => { form.clearResult(); onRefresh(); } },
      market: { label: 'Về sàn khoản vay', onPress: toMarket },
    };
    const view = describeResult(form.result, loan.id);
    return (
      <LoanDetailFrame title={title}>
        <LoanStatusCard
          icon={view.icon}
          danger={view.danger}
          title={view.title}
          message={view.message}
          primary={actions[view.primary]}
          secondary={actions[view.secondary]}
        />
      </LoanDetailFrame>
    );
  }

  const repaymentLabel = REPAYMENT_METHOD_LABEL[loan.repaymentMethod] ?? loan.repaymentMethod;
  const footer = block ? null : (
    <InvestBar
      label={form.error ? 'Đầu tư' : `Đầu tư ${formatDong(form.amount)}`}
      onPress={() => void form.submit()}
      disabled={form.error !== null}
      loading={form.submitting}
    />
  );

  return (
    <LoanDetailFrame title={title} state={state} refresh={{ refreshing, onRefresh }} footer={footer}>
      <LoanHeroCard loan={loan} />
      <FundingProgressCard loan={loan} state={state} />
      <LoanTermsCard loan={loan} />
      {applicationNumber ? (
        <BorrowerSummaryCard
          applicationNumber={applicationNumber}
          onOpen={() => nav.navigate('BorrowerProfile', { applicationNumber })}
        />
      ) : null}
      {block ? (
        <LoanStatusCard
          icon={INVEST_BLOCK_COPY[block].icon}
          title={INVEST_BLOCK_COPY[block].title}
          message={INVEST_BLOCK_COPY[block].hint}
          primary={{ label: 'Về sàn khoản vay', onPress: toMarket }}
        />
      ) : (
        <>
          <InvestAmountField
            amount={form.amount}
            bounds={form.bounds}
            error={form.error}
            picks={form.picks}
            onChange={form.change}
          />
          <InvestEstimateCard
            amount={form.amount}
            estimate={form.estimate}
            annualRate={loan.annualRate}
            termMonths={loan.termMonths}
            repaymentLabel={repaymentLabel}
          />
          {form.submitError ? (
            <Text style={styles.submitError} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {form.submitError}
            </Text>
          ) : null}
        </>
      )}
    </LoanDetailFrame>
  );
}

type ResultAction = 'portfolio' | 'topUp' | 'retry' | 'market';

type ResultView = {
  /** Bỏ trống thì thẻ hiện robot chào. */
  icon?: IconName;
  danger?: boolean;
  title: string;
  message: string;
  primary: ResultAction;
  secondary: ResultAction;
};

/**
 * Một câu nói đúng điều vừa xảy ra với lệnh. Backend trả 201 cả khi ví không giữ được tiền, nên
 * phải đọc `status`; thiếu số dư thì mời nạp tiền như gợi ý của `OrderResponse`.
 */
function describeResult(order: InvestOrderResult, listingId: string): ResultView {
  const amount = formatDong(order.amount);
  switch (order.status) {
    case 'COMMITTED':
      return {
        title: 'Đã đặt lệnh đầu tư',
        message: `${amount} đang được giữ tạm trong ví cho khoản vay #${listingId}. Khi khoản vay gọi đủ vốn, bạn ký hợp đồng đầu tư để khoản vay được giải ngân.`,
        primary: 'portfolio',
        secondary: 'market',
      };
    case 'PENDING_FUNDS':
      return {
        icon: 'clock',
        title: 'Lệnh đang chờ ví xác nhận',
        message: 'Hệ thống đã ghi nhận lệnh nhưng ví chưa xác nhận giữ tiền. Kiểm tra lại trong danh mục đầu tư sau ít phút.',
        primary: 'portfolio',
        secondary: 'market',
      };
    case 'REJECTED':
      return order.rejectedReasonCode === 'PAYMENT_INSUFFICIENT_BALANCE'
        ? {
            icon: 'wallet',
            danger: true,
            title: 'Ví chưa đủ số dư',
            message: `Số dư khả dụng không đủ để giữ ${amount} cho lệnh này nên lệnh chưa được đặt. Nạp thêm tiền rồi đặt lại.`,
            primary: 'topUp',
            secondary: 'retry',
          }
        : {
            icon: 'alert',
            danger: true,
            title: 'Lệnh chưa được đặt',
            message: order.rejectedReasonDetail ?? 'Hệ thống không giữ được tiền cho lệnh này.',
            primary: 'retry',
            secondary: 'market',
          };
    case 'CANCELLED':
      return {
        icon: 'circleX',
        title: 'Lệnh đã được huỷ',
        message: 'Lệnh này đã được huỷ trước đó, tiền giữ tạm đã trả về ví.',
        primary: 'retry',
        secondary: 'market',
      };
    default:
      return {
        icon: 'info',
        title: 'Đã gửi lệnh',
        message: 'Mở danh mục đầu tư để xem trạng thái mới nhất của lệnh.',
        primary: 'portfolio',
        secondary: 'market',
      };
  }
}

const styles = StyleSheet.create({
  skeleton: { gap: Spacing.xl },
  submitError: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.redBg,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.tagRedText,
  },
});
