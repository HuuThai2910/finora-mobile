import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, Text_, tabularNums } from '@/theme';
import { FormStepProgress, PHeader, PItem, Screen } from '@/components/phone';
import { Button } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import RepaymentScheduleList from '@/components/loan/RepaymentScheduleList';
import { useAsync } from '@/hooks/useAsync';
import { formatDong, formatVND } from '@/utils/format';
import type { MarketStackParamList } from '@/navigation/types';
import { REPAYMENT_METHOD_LABEL } from '../constant';
import { getRepaymentPreview } from '../api';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'Schedule'>;

/**
 * Màn 12 — lịch trả nợ dự kiến.
 * Số liệu do backend tính (`POST /loan-products/{id}/repayment-previews`);
 * client không tự tính tiền.
 */
export default function ScheduleScreen() {
  const nav = useNavigation<Nav>();
  const { productId, amount, termMonths, expectedDisbursementDate } = useRoute<RouteProp<MarketStackParamList, 'Schedule'>>().params;

  const { data, loading, error, reload } = useAsync(
    () =>
      getRepaymentPreview(productId, {
        amount,
        termMonths,
        expectedDisbursementDate,
      }),
    [productId, amount, termMonths, expectedDisbursementDate],
  );

  if (loading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (error) {
    return (
      <Screen>
        <ErrorState
          message={error}
          hint="Thông tin khoản vay bạn đã chọn vẫn được giữ nguyên."
          onRetry={reload}
        />
      </Screen>
    );
  }
  if (!data) return null;

  const method = REPAYMENT_METHOD_LABEL[data.repaymentMethod] ?? data.repaymentMethod;

  return (
    <Screen
      footer={
        <Button
          label="Tiếp tục nhập hồ sơ →"
          variant="navyPill"
          onPress={() => nav.navigate('ApplyForm', {
            productId,
            amount,
            termMonths,
            expectedDisbursementDate,
          })}
        />
      }
    >
      <PHeader title="Xác nhận khoản vay" back />
      <FormStepProgress current={2} total={3} label="Xem lịch trả dự kiến" />

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>TỔNG SỐ TIỀN VAY</Text>
        <Text style={styles.summaryAmount}>{formatDong(amount)}</Text>
        <Text style={styles.summaryMeta}>
          {termMonths} tháng · {data.annualInterestRate}%/năm · kỳ đầu {formatDong(data.firstInstallment)}
        </Text>
      </View>

      <View style={styles.totals}>
        <View style={[styles.total, styles.totalBrand]}>
          <Text style={styles.totalLabel}>TỔNG TRẢ</Text>
          <Text style={[styles.totalValue, { color: Colors.brand }]}>
            {formatVND(data.totalRepayment)}
          </Text>
        </View>
        <View style={[styles.total, styles.totalGreen]}>
          <Text style={styles.totalLabel}>TỔNG LÃI</Text>
          <Text style={[styles.totalValue, { color: Colors.emerald }]}>
            {formatVND(data.totalInterest)}
          </Text>
        </View>
      </View>

      <PItem label="Kỳ đầu trả" value={formatDong(data.firstInstallment)} />
      <PItem label="Kỳ cao nhất" value={formatDong(data.maximumInstallment)} last />

      <Text style={styles.method}>Phương thức trả: {method}</Text>
      <RepaymentScheduleList periods={data.periods} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { padding: Spacing.xxl, marginBottom: Spacing.xl, alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.navy, borderRadius: Radius.xl },
  summaryLabel: { ...Text_.captionBold, color: Colors.onDarkMuted },
  summaryAmount: { fontFamily: FontFamily.extrabold, fontSize: FontSize.figure, color: Colors.onDark, ...tabularNums },
  summaryMeta: { ...Text_.micro, color: Colors.onDarkMuted, textAlign: 'center' },
  totals: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.xl },
  total: { flex: 1, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', gap: Spacing.xs },
  totalBrand: { backgroundColor: Colors.brand50 },
  totalGreen: { backgroundColor: Colors.greenBg },
  totalLabel: { ...Text_.caption, color: Colors.ink3, letterSpacing: 0.5 },
  totalValue: { fontFamily: FontFamily.extrabold, fontSize: FontSize.title, ...tabularNums },
  method: { ...Text_.micro, color: Colors.ink3, marginTop: Spacing.xl, textAlign: 'center' },
});
