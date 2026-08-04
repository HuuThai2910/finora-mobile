import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Field, ProgressBar, ScoreRing, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong, formatVND } from '@/utils/format';
import { toUserMessage } from '@/lib/api';
import type { MarketStackParamList } from '@/navigation/types';
import { useMarketLoan } from '../hook/useMarket';
import { invest } from '../api';

/** Màn 19 — chi tiết khoản vay trên sàn (người vay ẩn danh). */
export default function LoanDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<RouteProp<MarketStackParamList, 'LoanDetail'>>();
  const { data, loading, error, reload } = useMarketLoan(route.params.loanId);

  const [amount, setAmount] = useState('5.000.000');
  const [submitting, setSubmitting] = useState(false);
  const [investError, setInvestError] = useState<string | null>(null);

  const parsed = Number(amount.replace(/\D/g, ''));

  const onInvest = async () => {
    if (!parsed) {
      setInvestError('Nhập số tiền muốn đầu tư.');
      return;
    }
    setInvestError(null);
    setSubmitting(true);
    try {
      await invest();
      Alert.alert(
        'Đã đặt lệnh',
        'Tiền được phong tỏa trong ví và chỉ chuyển đi khi khoản vay gọi đủ 100% vốn.',
        [{ text: 'Xong', onPress: () => nav.goBack() }],
      );
    } catch (e) {
      setInvestError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Screen><LoadingScreen cards={2} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return null;

  return (
    <Screen>
      <PHeader title={data.id} back right={<Tag tone="blue" small>Đang gọi vốn</Tag>} />

      <View style={styles.hero}>
        <ScoreRing grade={data.grade} size={69} />
        <View style={styles.heroText}>
          <Text style={styles.amount}>{formatVND(data.amount)}</Text>
          <Text style={styles.purpose}>
            {data.purpose} · {data.region}
          </Text>
        </View>
      </View>

      <PItem label="Lãi suất" value={`${data.annualRate}%/năm giảm dần`} />
      <PItem label="Kỳ hạn" value={`${data.termMonths} tháng`} />
      <PItem label="Lịch sử người vay" value={data.borrowerHistory} last />

      <View style={styles.progressHead}>
        <Text style={styles.progressLabel}>Tiến độ gọi vốn</Text>
        <Text style={styles.progressValue}>{data.fundedPercent}%</Text>
      </View>
      <ProgressBar percent={data.fundedPercent} label="Tiến độ gọi vốn" />

      <Field
        label="Số tiền đầu tư"
        value={amount}
        onChangeText={setAmount}
        keyboardType="number-pad"
        error={investError ?? undefined}
        style={styles.field}
      />

      <Button
        label="Đầu tư — phong tỏa ví"
        variant="emerald"
        onPress={onInvest}
        loading={submitting}
      />

      <Text style={styles.estimate}>
        Nhận ~{formatDong(data.estimatedMonthlyReturn)}/tháng · tổng ~
        {formatVND(data.estimatedTotalReturn)} sau {data.termMonths} tháng
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, marginBottom: Spacing.xl },
  heroText: { flexShrink: 1, gap: 2 },
  amount: { ...Text_.display, color: Colors.ink },
  purpose: { ...Text_.micro, color: Colors.ink3 },
  progressHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  progressLabel: { ...Text_.micro, color: Colors.ink3 },
  progressValue: { ...Text_.microBold, color: Colors.ink },
  field: { marginTop: Spacing.xxl },
  estimate: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
