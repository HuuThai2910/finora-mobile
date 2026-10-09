import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveBackdrop } from '@/components/phone';
import { WALLET_HISTORY_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import type { WalletStackParamList } from '@/navigation/types';
import { Spacing } from '@/theme';
import type { TopUpOrder } from '@/types/wallet';
import { TOPUP_PAYMENT_NOTE, WALLET_HISTORY_MAX_WIDTH, WALLET_HISTORY_PADDING } from '../constant';
import { useCountdown } from '../hook/useCountdown';
import { useTopUp } from '../hook/useTopUp';
import { useBalance } from '../hook/useWallet';
import { providerLabel, topUpDetailRows, topUpOutcome, topUpStatusView } from '../mappers/topUp';
import TopUpDetailsCard from './TopUpDetailsCard';
import TopUpForm from './TopUpForm';
import TopUpOutcomeCard from './TopUpOutcomeCard';
import TopUpPaymentCard from './TopUpPaymentCard';
import WalletAccountCard from './WalletAccountCard';
import WalletButton from './WalletButton';
import WalletHeader from './WalletHeader';
import WalletNote from './WalletNote';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'TopUp'>;

/**
 * Màn nạp tiền vào ví, cùng bộ với "Lịch sử ví": nền hai linh vật trao đồng xu, thẻ tài khoản ví,
 * rồi tới việc của màn. Một màn đi qua ba bước: nhập số tiền → thanh toán lệnh vừa tạo (mã QR, đếm
 * lùi hạn thanh toán) → kết quả. Trạng thái lệnh luôn lấy từ Payment Service, app không tự suy ra.
 */
export default function TopUpScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, WALLET_HISTORY_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để nền trơn phủ tới đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);

  const balance = useBalance();
  const topUp = useTopUp();
  const { order, busy, error } = topUp;
  const phase = order ? topUpStatusView(order.status).phase : null;
  const secondsLeft = useCountdown(order?.expiresAt ?? null, phase === 'pending');

  const backToWallet = () => {
    // Mở từ nút "Nạp" ở trang chủ thì stack Ví chỉ có mỗi màn này, popToTop không có chỗ để về.
    if (nav.getState().routes[0]?.name === 'WalletHistory') nav.popToTop();
    else nav.replace('WalletHistory');
  };

  // Tạo lệnh mới sau khi đã nạp xong: tải lại số dư để thẻ tài khoản không hiện số cũ.
  const startOver = () => {
    topUp.reset();
    balance.reload();
  };

  const renderPending = (current: TopUpOrder) => {
    // Quá hạn thanh toán (theo `expiresAt` của backend) thì cất nút trả tiền, đưa "Tạo giao dịch
    // mới" lên làm nút chính; vẫn giữ "Kiểm tra trạng thái" cho trường hợp đã trả trước hạn.
    const expired = secondsLeft === 0;
    return (
      <>
        <TopUpPaymentCard order={current} secondsLeft={secondsLeft} />
        <View style={styles.actions}>
          {expired ? <WalletButton label="Tạo giao dịch mới" onPress={startOver} /> : null}
          {!expired && current.status === 'AWAITING_PAYMENT' && current.checkoutUrl ? (
            <WalletButton
              label={`Mở ${providerLabel(current.provider)} để thanh toán`}
              icon="arrowUpRight"
              onPress={() => void topUp.openProvider()}
              disabled={busy !== null}
            />
          ) : null}
          {!expired && current.mockCompletionAvailable ? (
            <WalletButton
              label="Giả lập thanh toán thành công"
              onPress={topUp.completeMock}
              loading={busy === 'complete'}
              disabled={busy !== null}
            />
          ) : null}
          <WalletButton
            label="Kiểm tra trạng thái"
            variant="outline"
            icon="refreshCw"
            onPress={topUp.refresh}
            loading={busy === 'refresh'}
            disabled={busy !== null}
          />
        </View>
        {error ? <WalletNote tone="danger" text={error} /> : null}
        <TopUpDetailsCard rows={topUpDetailRows(current, false)} />
        <WalletNote text={TOPUP_PAYMENT_NOTE} />
      </>
    );
  };

  const renderOutcome = (current: TopUpOrder, outcomePhase: 'completed' | 'failed' | 'reconcile') => {
    const { title, detail } = topUpOutcome(current);
    const toWallet = { label: 'Về ví', onPress: backToWallet };
    const actions = {
      completed: { primary: toWallet, secondary: { label: 'Nạp thêm', onPress: startOver } },
      failed: { primary: { label: 'Tạo giao dịch mới', onPress: startOver }, secondary: toWallet },
      reconcile: {
        primary: { label: 'Kiểm tra lại', onPress: topUp.refresh, loading: busy === 'refresh' },
        secondary: toWallet,
      },
    }[outcomePhase];
    return (
      <>
        <TopUpOutcomeCard phase={outcomePhase} title={title} detail={detail} {...actions} />
        {error ? <WalletNote tone="danger" text={error} /> : null}
        <TopUpDetailsCard rows={topUpDetailRows(current, true)} />
      </>
    );
  };

  const renderBody = () => {
    if (!order || !phase) {
      return (
        <>
          <WalletAccountCard
            available={balance.data?.available ?? null}
            held={balance.data?.held ?? null}
            loading={balance.loading}
            error={balance.error}
            onRetry={balance.reload}
          />
          <TopUpForm
            onSubmit={amount => void topUp.create(amount)}
            submitting={busy === 'create'}
            submitError={error}
          />
        </>
      );
    }
    return phase === 'pending' ? renderPending(order) : renderOutcome(order, phase);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
      >
        <View style={{ width, minHeight: viewportHeight }}>
          <WaveBackdrop background={WALLET_HISTORY_WAVES} width={width} />
          <View style={styles.content}>
            <WalletHeader title="Nạp tiền vào ví" width={width} topInset={insets.top} />
            <View style={styles.body}>{renderBody()}</View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Nền trơn của ảnh: phủ hai bên cột trên web rộng và lót lúc ảnh chưa nạp xong.
  root: { flex: 1, backgroundColor: Colors.walletHistoryFill },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { paddingHorizontal: WALLET_HISTORY_PADDING, paddingBottom: Spacing.page },
  body: { gap: Spacing.xl },
  actions: { gap: Spacing.md },
});
