import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveBackdrop } from '@/components/phone';
import { WALLET_HISTORY_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import { WALLET_HISTORY_MAX_WIDTH, WALLET_HISTORY_PADDING } from '../constant';
import WalletHeader from './WalletHeader';

type Props = {
  title: string;
  children: React.ReactNode;
  /** Có `onRefresh` thì màn hỗ trợ kéo để làm mới; `refreshing` chỉ bật khi đang tải lại dữ liệu đã có. */
  refreshing?: boolean;
  onRefresh?: () => void;
};

/**
 * Khung chung của các màn rút tiền, cùng bộ với "Nạp tiền vào ví": nền hai linh vật trao đồng xu, đầu màn có nút
 * quay lại và tiêu đề, nội dung cuộn trong cột cỡ điện thoại. Có tránh bàn phím vì màn rút tiền có ô nhập.
 */
export default function WalletScaffold({ title, children, refreshing = false, onRefresh }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, WALLET_HISTORY_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để nền trơn phủ tới đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              // iOS đọc `tintColor`, Android đọc `colors`.
              tintColor={Colors.authPrimary}
              colors={[Colors.authPrimary]}
            />
          ) : undefined
        }
      >
        <View style={{ width, minHeight: viewportHeight }}>
          <WaveBackdrop background={WALLET_HISTORY_WAVES} width={width} />
          <View style={styles.content}>
            <WalletHeader title={title} width={width} topInset={insets.top} />
            <View style={styles.body}>{children}</View>
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
});
