import { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Field, Icon, InfoNote, SectionLabel, Tag } from '@/components/ui';
import { formatDong } from '@/utils/format';
import { toUserMessage } from '@/lib/api';
import type { WalletStackParamList } from '@/navigation/types';
import type { TopUpOrder } from '@/types/wallet';
import { completeMockTopUp, createTopUp, getTopUp } from '../api';
import QrPlaceholder from './QrPlaceholder';

const MINIMUM = 10_000;
const MAXIMUM = 100_000_000;
type Nav = NativeStackNavigationProp<WalletStackParamList, 'TopUp'>;

export default function TopUpScreen() {
  const navigation = useNavigation<Nav>();
  const [amountText, setAmountText] = useState('1.000.000');
  const [order, setOrder] = useState<TopUpOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amount = Number(amountText.replace(/\D/g, ''));
  const returnToWallet = () => navigation.popToTop();

  const onAmountChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    setAmountText(digits ? new Intl.NumberFormat('vi-VN').format(Number(digits)) : '');
    setError(null);
  };

  const start = async () => {
    if (!Number.isInteger(amount) || amount < MINIMUM || amount > MAXIMUM) {
      setError('Nhập số tiền từ 10.000 đ đến 100.000.000 đ.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      setOrder(await createTopUp(amount));
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const refresh = async () => {
    if (!order) return;
    setSubmitting(true);
    setError(null);
    try {
      const latest = await getTopUp(order.topUpId);
      setOrder(latest);
      if (latest.status === 'COMPLETED') {
        Alert.alert('Nạp tiền thành công', `${formatDong(latest.amount)} đã được cộng vào ví FINORA.`);
      }
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const completeMock = async () => {
    if (!order) return;
    setSubmitting(true);
    setError(null);
    try {
      const completed = await completeMockTopUp(order.topUpId);
      setOrder(completed);
      Alert.alert('Nạp tiền thành công', `${formatDong(completed.amount)} đã được cộng vào ví FINORA.`, [
        { text: 'Về ví', onPress: returnToWallet },
      ]);
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const openProvider = async () => {
    if (!order?.checkoutUrl) return;
    if (!(await Linking.canOpenURL(order.checkoutUrl))) {
      setError('Thiết bị không mở được liên kết thanh toán ZaloPay.');
      return;
    }
    await Linking.openURL(order.checkoutUrl);
  };

  return (
    <Screen>
      <PHeader
        title="Nạp tiền vào ví"
        back
        right={<Icon name="wallet" size={IconSize.sm} color={Colors.ink2} />}
      />

      {!order ? (
        <>
          <Field
            label="Số tiền nạp"
            value={amountText}
            onChangeText={onAmountChange}
            keyboardType="number-pad"
            helper="Từ 10.000 đ đến 100.000.000 đ mỗi giao dịch."
            error={error ?? undefined}
            required
          />
          <Button label="Tạo giao dịch nạp tiền" onPress={start} loading={submitting} />
          <InfoNote style={styles.note}>
            Bản demo dùng Payment Service và sổ cái thật. Khi cấu hình ZaloPay sandbox, bước tiếp theo
            sẽ mở trang thanh toán; không phát sinh tiền thật.
          </InfoNote>
        </>
      ) : (
        <>
          <View style={styles.heading}>
            <View style={styles.headingText}>
              <Text style={styles.amount}>{formatDong(order.amount)}</Text>
              <Text style={styles.provider}>Qua {order.provider}</Text>
            </View>
            <Tag tone={order.status === 'COMPLETED' ? 'green' : 'amber'} small>
              {statusLabel(order.status)}
            </Tag>
          </View>

          {order.qrPayload ? <QrPlaceholder payload={order.qrPayload} /> : null}

          <SectionLabel>Thông tin giao dịch</SectionLabel>
          <PItem label="Mã FINORA" value={order.topUpId} />
          <PItem label="Mã đối tác" value={order.providerOrderId} />
          <PItem label="Trạng thái" value={statusLabel(order.status)} last />

          {order.status === 'AWAITING_PAYMENT' && order.checkoutUrl ? (
            <Button label="Mở ZaloPay để thanh toán" onPress={openProvider} style={styles.action} />
          ) : null}

          {order.mockCompletionAvailable ? (
            <Button label="Giả lập thanh toán thành công" onPress={completeMock} loading={submitting} style={styles.action} />
          ) : null}

          {order.status !== 'COMPLETED' ? (
            <Button label="Kiểm tra trạng thái" variant="outline" onPress={refresh} loading={submitting} style={styles.secondary} />
          ) : (
            <Button label="Về ví" onPress={returnToWallet} style={styles.action} />
          )}

          {error ? <InfoNote tone="warn" style={styles.note}>{error}</InfoNote> : null}
          <InfoNote style={styles.note}>
            Chỉ callback có chữ ký hợp lệ của ZaloPay hoặc nút giả lập khi chạy MOCK mới cộng tiền vào số dư.
          </InfoNote>
        </>
      )}
    </Screen>
  );
}

function statusLabel(status: TopUpOrder['status']): string {
  switch (status) {
    case 'PROVIDER_PENDING': return 'Đang tạo giao dịch';
    case 'AWAITING_PAYMENT': return 'Chờ thanh toán';
    case 'COMPLETED': return 'Đã nạp tiền';
    case 'FAILED': return 'Thất bại';
    case 'EXPIRED': return 'Đã hết hạn';
    case 'RECONCILIATION_REQUIRED': return 'Đang đối soát';
  }
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.lg },
  headingText: { flexShrink: 1 },
  amount: { ...Text_.h2, color: Colors.ink },
  provider: { ...Text_.micro, color: Colors.ink3, marginTop: Spacing.xs },
  action: { marginTop: Spacing.xl },
  secondary: { marginTop: Spacing.md },
  note: { marginTop: Spacing.xl },
});
