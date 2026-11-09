import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ErrorState } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { SearchField } from '@/features/products';
import type { MarketStackParamList, TabParamList } from '@/navigation/types';
import { Spacing } from '@/theme';
import { MARKET_MAX_WIDTH, MARKET_PADDING } from '../constant';
import { useMarketLoans } from '../hook/useMarket';
import { filterMarketLoans } from '../mapper';
import LoanCard from './LoanCard';
import MarketFooter from './MarketFooter';
import MarketHero from './MarketHero';
import MarketSkeleton from './MarketSkeleton';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<MarketStackParamList, 'Market'>,
  BottomTabNavigationProp<TabParamList>
>;

/** Đáy chừa một khoảng để thẻ cuối không sát thanh tab. */
const BOTTOM_SPACE = 40;

/**
 * Màn gốc của tab Sàn (chỉ nhà đầu tư) — sàn khoản vay (mockup 26/09/2026): banner robot, thẻ từng khoản vay đang
 * gọi vốn (kính lúp mở ô lọc theo mục đích vay, khu vực, mã hồ sơ), ghi chú phong toả tiền và lối sang chợ Notes.
 * Lối đó luôn hiện, kể cả khi sàn lỗi hoặc trống.
 */
export default function MarketScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, MARKET_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để nền liền màu tới đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);
  const { data, loading, error, reload } = useMarketLoans();
  // Ô tìm chỉ là lựa chọn tạm trên màn này nên giữ state cục bộ, cùng cách màn Sản phẩm vay.
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const toggleSearch = () => {
    // Đóng ô tìm thì bỏ luôn từ khoá để danh sách trở lại đầy đủ.
    if (searchOpen) setQuery('');
    setSearchOpen(!searchOpen);
  };

  const renderLoans = () => {
    if (loading && !data) return <MarketSkeleton />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (!data?.length) {
      return (
        <EmptyState
          icon="search"
          title="Chưa có khoản vay đang gọi vốn"
          hint="Hồ sơ mới sẽ hiện ở đây khi được duyệt. Kéo xuống để tải lại."
        />
      );
    }
    const loans = filterMarketLoans(data, query);
    if (!loans.length) {
      return (
        <EmptyState
          icon="search"
          title="Không tìm thấy khoản vay phù hợp"
          hint="Thử từ khoá khác, ví dụ mục đích vay như “kinh doanh”, “học phí” hoặc mã hồ sơ HS-…"
        />
      );
    }
    return loans.map(loan => (
      <LoanCard key={loan.id} loan={loan} onPress={() => nav.navigate('LoanDetail', { loanId: loan.id })} />
    ));
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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
        <MarketHero width={width} topInset={insets.top} searchOpen={searchOpen} onToggleSearch={toggleSearch} />
        <View style={styles.content}>
          {searchOpen ? (
            <SearchField
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery('')}
              placeholder="Tìm theo mục đích vay, khu vực, mã hồ sơ"
              accessibilityLabel="Tìm khoản vay trên sàn"
            />
          ) : null}
          <View style={styles.cards}>{renderLoans()}</View>
          <MarketFooter
            onNotesMarket={() => nav.navigate('Ví', { screen: 'SecondaryMarket' })}
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
