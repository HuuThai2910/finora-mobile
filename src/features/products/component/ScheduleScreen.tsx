import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, Text_, tabularNums } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, SectionLabel } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { useAsync } from '@/hooks/useAsync';
import { formatDate, formatDong, formatVND } from '@/utils/format';
import type { MarketStackParamList } from '@/navigation/types';
import { REPAYMENT_METHOD_LABEL, defaultDisbursementDate } from '../constant';
import { getRepaymentPreview } from '../api';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'Schedule'>;

const VISIBLE_ROWS = 6;

/**
 * Màn 12 — lịch trả nợ dự kiến.
 * Số liệu do backend tính (`POST /loan-products/{id}/repayment-previews`);
 * client không tự tính tiền.
 */
export default function ScheduleScreen() {
  const nav = useNavigation<Nav>();
  const { productId, amount, termMonths } = useRoute<RouteProp<MarketStackParamList, 'Schedule'>>().params;

  const { data, loading, error, reload } = useAsync(
    () =>
      getRepaymentPreview(productId, {
        amount,
        termMonths,
        expectedDisbursementDate: defaultDisbursementDate(),
      }),
    [productId, amount, termMonths],
  );

  if (loading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return null;

  const rows = data.periods.slice(0, VISIBLE_ROWS);
  const remaining = data.periods.length - rows.length;
  const method = REPAYMENT_METHOD_LABEL[data.repaymentMethod] ?? data.repaymentMethod;

  return (
    <Screen
      footer={
        <Button
          label="Bắt đầu vay sản phẩm này →"
          variant="navyPill"
          onPress={() => nav.navigate('ApplyForm', { productId })}
        />
      }
    >
      <PHeader title="Lịch trả nợ dự kiến" back hint={`${termMonths} tháng`} />

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

      <SectionLabel muted style={styles.section}>
        Lịch trả từng kỳ
      </SectionLabel>

      <View style={styles.thead}>
        <Text style={[styles.th, styles.colPeriod]}>Kỳ</Text>
        <Text style={[styles.th, styles.colDate]}>Ngày hạn</Text>
        <Text style={[styles.th, styles.colNum]}>Gốc</Text>
        <Text style={[styles.th, styles.colNum]}>Lãi</Text>
        <Text style={[styles.th, styles.colNum]}>Tổng</Text>
      </View>

      {rows.map(p => (
        <View key={p.period} style={styles.tr}>
          <Text style={[styles.tdStrong, styles.colPeriod]}>{p.period}</Text>
          <Text style={[styles.td, styles.colDate]}>{formatDate(p.dueDate)}</Text>
          <Text style={[styles.td, styles.colNum]}>{formatVND(p.principal)}</Text>
          <Text style={[styles.td, styles.colNum]}>{formatVND(p.interest)}</Text>
          <Text style={[styles.tdStrong, styles.colNum]}>{formatVND(p.totalDue)}</Text>
        </View>
      ))}

      {remaining > 0 ? (
        <Text style={styles.tail}>
          … {remaining} kỳ tiếp theo · {method.toLowerCase()}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  totals: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.xl },
  total: { flex: 1, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', gap: Spacing.xs },
  totalBrand: { backgroundColor: Colors.brand50 },
  totalGreen: { backgroundColor: Colors.greenBg },
  totalLabel: { ...Text_.caption, color: Colors.ink3, letterSpacing: 0.5 },
  totalValue: { fontFamily: FontFamily.extrabold, fontSize: FontSize.title, ...tabularNums },
  section: { marginTop: Spacing.xxl },
  thead: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  th: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.caption,
    color: Colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tr: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  td: { fontFamily: FontFamily.regular, fontSize: FontSize.micro, color: Colors.ink, ...tabularNums },
  tdStrong: { fontFamily: FontFamily.bold, fontSize: FontSize.micro, color: Colors.ink, ...tabularNums },
  colPeriod: { flex: 0.5 },
  colDate: { flex: 1.2 },
  colNum: { flex: 1.2, textAlign: 'right' },
  tail: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
