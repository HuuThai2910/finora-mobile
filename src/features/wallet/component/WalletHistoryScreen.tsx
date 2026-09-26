import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveBackdrop } from '@/components/phone';
import { WALLET_HISTORY_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import type { WalletStackParamList } from '@/navigation/types';
import { FontFamily, Spacing } from '@/theme';
import { WALLET_HISTORY_MAX_WIDTH, WALLET_HISTORY_PADDING } from '../constant';
import { useBalance, useTransactions } from '../hook/useWallet';
import { groupWalletTransactions } from '../mappers/walletHistory';
import WalletAccountCard from './WalletAccountCard';
import WalletHistoryHeader from './WalletHistoryHeader';
import WalletHistorySkeleton from './WalletHistorySkeleton';
import WalletHistoryStatus from './WalletHistoryStatus';
import WalletReconcileNote from './WalletReconcileNote';
import WalletTxCard from './WalletTxCard';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'WalletHistory'>;

/** Đáy chừa một khoảng để ô ghi chú cuối không sát thanh tab. */
const BOTTOM_SPACE = 40;

/**
 * Màn 25 — lịch sử ví, cũng là màn gốc của tab Ví (mockup 26/09/2026): thẻ tài
 * khoản với số dư hiện tại, rồi giao dịch nhóm theo tháng, mỗi giao dịch một thẻ.
 * Danh sách ví ngắn nên vẽ bằng ScrollView để nền minh hoạ cuộn cùng nội dung.
 */
export default function WalletHistoryScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, WALLET_HISTORY_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để nền trơn phủ tới đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);

  const balance = useBalance();
  const transactions = useTransactions();
  const groups = useMemo(
    () => (transactions.data ? groupWalletTransactions(transactions.data) : []),
    [transactions.data],
  );

  const refreshing = (transactions.loading && !!transactions.data) || (balance.loading && !!balance.data);
  const refresh = () => {
    balance.reload();
    transactions.reload();
  };

  const renderBody = () => {
    if (transactions.loading && !transactions.data) return <WalletHistorySkeleton />;
    if (transactions.error) {
      return (
        <WalletHistoryStatus kind="error" message={transactions.error} onRetry={transactions.reload} />
      );
    }
    if (groups.length === 0) {
      return <WalletHistoryStatus kind="empty" onTopUp={() => nav.navigate('TopUp')} />;
    }
    return (
      <>
        {groups.map(group => (
          <View key={group.key} style={styles.group}>
            <Text style={styles.month} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
              {group.title}
            </Text>
            {group.items.map(tx => (
              <WalletTxCard key={tx.id} tx={tx} />
            ))}
          </View>
        ))}
        <WalletReconcileNote />
      </>
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
      refreshControl={
        <RefreshControl
          // Lần tải đầu đã có khung giả; vòng xoay chỉ dành cho kéo làm mới.
          refreshing={refreshing}
          onRefresh={refresh}
          // iOS đọc `tintColor`, Android đọc `colors`.
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={WALLET_HISTORY_WAVES} width={width} />
        <View style={styles.content}>
          <WalletHistoryHeader width={width} topInset={insets.top} />
          <WalletAccountCard
            available={balance.data?.available ?? null}
            loading={balance.loading}
            error={balance.error}
            onRetry={balance.reload}
          />
          <View style={styles.list}>{renderBody()}</View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trơn của ảnh: phủ hai bên cột trên web rộng và lót lúc ảnh chưa nạp xong.
  root: { flex: 1, backgroundColor: Colors.walletHistoryFill },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { paddingHorizontal: WALLET_HISTORY_PADDING, paddingBottom: BOTTOM_SPACE },
  list: { marginTop: Spacing.xl, gap: Spacing.xl },
  group: { gap: Spacing.md },
  month: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authMuted,
    marginBottom: Spacing.xs,
  },
});
