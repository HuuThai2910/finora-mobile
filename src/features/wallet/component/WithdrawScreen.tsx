import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Field, InfoNote, SectionLabel, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong } from '@/utils/format';
import { toUserMessage } from '@/lib/api';
import { AML_NOTE } from '../constant';
import { useBalance, useLinkedAccount, useWithdrawQuote } from '../hook/useWallet';
import { withdraw } from '../api';

/** Màn 24 — rút tiền về tài khoản chính chủ (quy tắc B1 chống rửa tiền). */
export default function WithdrawScreen() {
  const nav = useNavigation();
  const balance = useBalance();
  const account = useLinkedAccount();
  const quote = useWithdrawQuote();

  const [amount, setAmount] = useState('3.000.000');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loading = balance.loading || account.loading || quote.loading;
  const loadError = balance.error ?? account.error ?? quote.error;
  const reload = () => {
    balance.reload();
    account.reload();
    quote.reload();
  };

  const parsed = Number(amount.replace(/\D/g, ''));

  const onSubmit = async () => {
    if (!parsed) {
      setError('Nhập số tiền cần rút.');
      return;
    }
    if (balance.data && parsed > balance.data.available) {
      setError('Số tiền vượt quá số dư khả dụng.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await withdraw();
      Alert.alert('Đã gửi lệnh rút', 'Tiền về tài khoản trong khoảng 30 giây.', [
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

  return (
    <Screen>
      <PHeader
        title="Rút tiền"
        back
        hint={balance.data ? `Số dư: ${formatDong(balance.data.available)}` : undefined}
      />

      <Field
        label="Số tiền rút"
        value={amount}
        onChangeText={setAmount}
        keyboardType="number-pad"
        error={error ?? undefined}
        required
      />

      <SectionLabel>Về tài khoản liên kết</SectionLabel>

      {account.data ? (
        <View style={styles.bank}>
          <View style={styles.bankInfo}>
            <Text style={styles.bankName}>{account.data.bank}</Text>
            <Text style={styles.bankMeta}>
              {account.data.maskedNumber} · {account.data.holder}
            </Text>
          </View>
          {account.data.verified ? <Tag tone="green" small>Chính chủ ✓</Tag> : null}
        </View>
      ) : null}

      {quote.data ? (
        <>
          <PItem label="Phí rút" value={formatDong(quote.data.fee)} />
          <PItem
            label="Thời gian"
            value={`~${quote.data.estimatedSeconds} giây (${quote.data.channel})`}
            last
          />
        </>
      ) : null}

      <Button
        label="Xác nhận rút"
        onPress={onSubmit}
        loading={submitting}
        style={styles.action}
      />

      <InfoNote tone="warn" style={styles.note}>
        {AML_NOTE}
      </InfoNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bank: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.brand,
    borderRadius: Radius.lg,
    backgroundColor: Colors.brand50,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  bankInfo: { flexShrink: 1, gap: 2 },
  bankName: { ...Text_.bodyBold, color: Colors.ink },
  bankMeta: { ...Text_.micro, color: Colors.ink3 },
  action: { marginTop: Spacing.xl },
  note: { marginTop: Spacing.xl },
});
