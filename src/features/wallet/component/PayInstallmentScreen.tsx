import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_, tabularNums } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong } from '@/utils/format';
import { toUserMessage } from '@/lib/api';
import { PAYMENT_NOTE } from '../constant';
import { useBalance, useDueInstallment } from '../hook/useWallet';
import { payInstallment } from '../api';

/** Màn 22 — thanh toán kỳ đến hạn từ ví (không dùng tiền mặt). */
export default function PayInstallmentScreen() {
  const nav = useNavigation();
  const due = useDueInstallment();
  const balance = useBalance();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = due.loading || balance.loading;
  const loadError = due.error ?? balance.error;
  const reload = () => {
    due.reload();
    balance.reload();
  };

  const insufficient = !!(due.data && balance.data && balance.data.available < due.data.total);

  const onPay = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await payInstallment();
      Alert.alert('Thanh toán thành công', 'Gốc và lãi đã được phân bổ về các nhà đầu tư.', [
        { text: 'Xong', onPress: () => nav.goBack() },
      ]);
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Screen><LoadingScreen cards={2} /></Screen>;
  if (loadError) return <Screen><ErrorState message={loadError} onRetry={reload} /></Screen>;
  if (!due.data) return null;

  const d = due.data;

  return (
    <Screen>
      <PHeader title={`Thanh toán kỳ ${d.period}`} back hint={d.loanId} />

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>TỔNG THANH TOÁN</Text>
        <Text style={styles.heroValue}>{formatDong(d.total)}</Text>
        <Tag tone="amber" small>{`Đến hạn ${d.dueDate} · còn ${d.daysLeft} ngày`}</Tag>
      </View>

      <PItem label="Gốc kỳ này" value={formatDong(d.principal)} />
      <PItem label="Lãi (dư nợ giảm dần)" value={formatDong(d.interest)} />
      <PItem
        label="Nguồn tiền"
        value={balance.data ? `Ví · ${formatDong(balance.data.available)}` : '—'}
        last
      />

      {insufficient ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          Số dư ví không đủ. Nạp thêm trước khi thanh toán.
        </Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label="Thanh toán từ ví"
        variant="emerald"
        onPress={onPay}
        loading={submitting}
        disabled={insufficient}
        style={styles.action}
      />

      <Text style={styles.note}>{PAYMENT_NOTE}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.xxl },
  heroLabel: { ...Text_.caption, color: Colors.ink3, letterSpacing: 0.6 },
  heroValue: { ...Text_.hero, color: Colors.ink, ...tabularNums },
  error: { ...Text_.micro, color: Colors.red, marginTop: Spacing.lg },
  action: { marginTop: Spacing.xl },
  note: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
