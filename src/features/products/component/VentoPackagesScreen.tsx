import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ErrorState } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import type { MarketStackParamList } from '@/navigation/types';
import PackageCard from '../components/PackageCard';
import PackageListSkeleton from '../components/PackageListSkeleton';
import PackagesHero from '../components/PackagesHero';
import { PACKAGE_CARD_GAP, PACKAGES_MAX_WIDTH, PACKAGES_PADDING } from '../constant';
import { useVentoPackages } from '../hook/useProducts';
import { toPackageCardView } from '../mappers/packageCard';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'VentoPackages'>;

/** Đáy chừa một khoảng để thẻ cuối không sát thanh tab. */
const BOTTOM_SPACE = 40;

/**
 * Màn 27 — gói vay ưu đãi (mockup 26/09/2026): banner robot cầm hộp quà, rồi thẻ
 * trắng từng gói với lãi suất và ba thông số. Bấm thẻ mở chi tiết gói.
 */
export default function VentoPackagesScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, PACKAGES_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để nền liền màu tới đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);
  const { data, loading, error, reload } = useVentoPackages();

  const renderPackages = () => {
    if (loading && !data) return <PackageListSkeleton />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (!data?.length) {
      return (
        <EmptyState
          icon="search"
          title="Chưa có gói vay ưu đãi"
          hint="Bạn vẫn có thể vay theo các sản phẩm vay thông thường."
          actionLabel="Xem sản phẩm vay"
          onAction={() => nav.navigate('Products')}
        />
      );
    }
    return data.map(pkg => (
      <PackageCard
        key={pkg.code}
        view={toPackageCardView(pkg)}
        onPress={() => nav.navigate('PackageDetail', { code: pkg.code })}
      />
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
        <PackagesHero width={width} topInset={insets.top} />
        <View style={styles.cards}>{renderPackages()}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trùng hàng cuối banner: phủ hai bên cột trên web rộng, nối liền mép dưới ảnh.
  root: { flex: 1, backgroundColor: Colors.packagesFill },
  scroll: { flexGrow: 1, alignItems: 'center' },
  cards: { gap: PACKAGE_CARD_GAP, paddingHorizontal: PACKAGES_PADDING, paddingBottom: BOTTOM_SPACE },
});
