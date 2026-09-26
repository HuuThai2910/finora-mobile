import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ErrorState } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import type { MarketStackParamList } from '@/navigation/types';
import { Spacing } from '@/theme';
import { MARKET_MAX_WIDTH, MARKET_PADDING } from '../constant';
import { useMarketLoans } from '../hook/useMarket';
import LoanCard from './LoanCard';
import MarketFooter from './MarketFooter';
import MarketHero from './MarketHero';
import MarketSkeleton from './MarketSkeleton';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'Market'>;

/** Đáy chừa một khoảng để thẻ cuối không sát thanh tab. */
const BOTTOM_SPACE = 40;

/**
 * Màn gốc của tab Sàn — sàn khoản vay (mockup 26/09/2026): banner robot, thẻ
 * từng khoản vay đang gọi vốn, ghi chú phong toả tiền và hai lối sang sản phẩm
 * vay / gói vay ưu đãi. Hai lối đó luôn hiện, kể cả khi sàn lỗi hoặc trống.
 */
export default function MarketScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, MARKET_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để nền liền màu tới đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);
  const { data, loading, error, reload } = useMarketLoans();

  const renderLoans = () => {
    if (loading && !data) return <MarketSkeleton />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (!data?.length) {
      return (
        <EmptyState
          icon="search"
          title="Chưa có khoản vay đang gọi vốn"
          hint="Bật Auto-Invest để được khớp ngay khi có hồ sơ mới."
        />
      );
    }
    return data.map(loan => (
      <LoanCard key={loan.id} loan={loan} onPress={() => nav.navigate('LoanDetail', { loanId: loan.id })} />
    ));
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
          refreshing={loading && !!data}
          onRefresh={reload}
          // iOS đọc `tintColor`, Android đọc `colors`.
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <MarketHero width={width} topInset={insets.top} />
        <View style={styles.content}>
          <View style={styles.cards}>{renderLoans()}</View>
          <MarketFooter
            onProducts={() => nav.navigate('Products')}
            onPackages={() => nav.navigate('VentoPackages')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trùng hàng cuối banner: phủ hai bên cột trên web rộng, nối liền mép dưới ảnh.
  root: { flex: 1, backgroundColor: Colors.marketFill },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.xl, paddingHorizontal: MARKET_PADDING, paddingBottom: BOTTOM_SPACE },
  cards: { gap: Spacing.lg },
});
