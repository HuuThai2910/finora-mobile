import { useCallback, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Radius, SoftShadow, Spacing, lh } from '@/theme';
import { ErrorState } from '@/components/feedback';
import type { MarketStackParamList } from '@/navigation/types';
import { LOAN_STEP_GUTTER } from '../constant';
import { useRepaymentPreview } from '../hooks/useRepaymentPreview';
import { toScheduleSummaryView } from '../mappers/repaymentSchedule';
import LoanPrimaryButton from '../components/LoanPrimaryButton';
import LoanStepBackdrop from '../components/LoanStepBackdrop';
import LoanStepFooter from '../components/LoanStepFooter';
import LoanStepHeader from '../components/LoanStepHeader';
import ScheduleEmptyNote from '../components/ScheduleEmptyNote';
import ScheduleIntro from '../components/ScheduleIntro';
import SchedulePeriodCard from '../components/SchedulePeriodCard';
import ScheduleSkeleton from '../components/ScheduleSkeleton';
import ScheduleSummaryCard from '../components/ScheduleSummaryCard';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'Schedule'>;

/** Khoảng cách giữa các thẻ kỳ, đo từ mockup. */
const CARD_GAP = 12;

/**
 * Bước 2/3 "Xác nhận khoản vay" — lịch trả dự kiến, vẽ theo mockup 26/09/2026.
 * Số liệu do backend tính (`POST /loan-products/{id}/repayment-previews`);
 * client không tự tính tiền. Sang bước 3 với đúng bốn tham số nhận từ bước 1.
 */
export default function ScheduleScreen() {
  const nav = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<MarketStackParamList, 'Schedule'>>();
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useRepaymentPreview(params.productId, params);

  // Những kỳ người dùng đã bấm đổi so với mặc định (kỳ đầu mở, các kỳ sau thu gọn).
  // Giữ ở màn chứ không trong từng thẻ: FlatList gỡ thẻ đã cuộn xa khỏi màn hình,
  // state đặt trong thẻ sẽ mất khi người dùng cuộn lại.
  const [toggled, setToggled] = useState<ReadonlySet<number>>(() => new Set());

  // Một tham chiếu cho cả danh sách để thẻ kỳ (đã memo) không vẽ lại khi thẻ khác đổi.
  const togglePeriod = useCallback((period: number) => {
    setToggled(current => {
      const next = new Set(current);
      if (next.has(period)) next.delete(period);
      else next.add(period);
      return next;
    });
  }, []);

  // Mở thẳng màn này (tải lại trang web) thì không còn bước 1 phía sau để quay về.
  const goBack = () =>
    nav.canGoBack() ? nav.goBack() : nav.navigate('ProductDetail', { productId: params.productId });

  const goToApplyForm = () =>
    nav.navigate('ApplyForm', {
      productId: params.productId,
      amount: params.amount,
      termMonths: params.termMonths,
      expectedDisbursementDate: params.expectedDisbursementDate,
    });

  const header = <LoanStepHeader title="Xác nhận khoản vay" step={2} total={3} onBack={goBack} />;
  const frame = [styles.content, { paddingTop: insets.top + Spacing.sm }];

  // Đang tải hoặc lỗi: vẫn giữ đầu màn để người vay quay lại được. Như màn cũ, nút
  // sang bước 3 chỉ xuất hiện khi đã có lịch để xem.
  if (loading || error || !data) {
    return (
      <LoanStepBackdrop>
        <ScrollView style={styles.scroll} contentContainerStyle={frame} showsVerticalScrollIndicator={false}>
          {header}
          <View style={styles.belowHeader}>
            {loading ? (
              <ScheduleSkeleton />
            ) : error ? (
              <View style={styles.errorCard}>
                <ErrorState
                  message={error}
                  hint="Thông tin khoản vay bạn đã chọn vẫn được giữ nguyên."
                  onRetry={reload}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </LoanStepBackdrop>
    );
  }

  const summary = toScheduleSummaryView(data, params);

  return (
    <LoanStepBackdrop>
      {/* Lịch có thể tới 60 kỳ nên dùng FlatList: chỉ dựng những thẻ gần vùng nhìn thấy. */}
      <FlatList
        style={styles.scroll}
        // Kiểu TS ghi mảng, nhưng Loan Service bản cũ không trả `periods` (màn cũ cũng đỡ trường hợp này).
        data={data.periods ?? []}
        keyExtractor={item => String(item.period)}
        renderItem={({ item, index }) => (
          <SchedulePeriodCard
            period={item}
            expanded={(index === 0) !== toggled.has(item.period)}
            onToggle={togglePeriod}
          />
        )}
        extraData={toggled}
        ItemSeparatorComponent={CardGap}
        ListHeaderComponent={
          <View>
            {header}
            <View style={styles.belowHeader}>
              <ScheduleIntro />
            </View>
            <ScheduleSummaryCard summary={summary} />
            <Text style={styles.section} accessibilityRole="header">
              Lịch trả từng kỳ
            </Text>
          </View>
        }
        ListEmptyComponent={<ScheduleEmptyNote />}
        contentContainerStyle={frame}
        showsVerticalScrollIndicator={false}
      />
      <LoanStepFooter>
        <LoanPrimaryButton label="Tiếp tục" onPress={goToApplyForm} />
      </LoanStepFooter>
    </LoanStepBackdrop>
  );
}

function CardGap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: LOAN_STEP_GUTTER, paddingBottom: Spacing.xxl },
  belowHeader: { marginTop: Spacing.xxl },
  errorCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    ...SoftShadow.card,
  },
  section: {
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.lg,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.title,
    lineHeight: lh(FontSize.title, LineHeight.heading),
    color: Colors.authInk,
  },
  gap: { height: CARD_GAP },
});
