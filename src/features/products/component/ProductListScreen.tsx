import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import type { MarketStackParamList } from '@/navigation/types';
import { useProducts } from '../hook/useProducts';
import { filterProductsByName } from '../mappers/productCard';
import { PRODUCT_CARD_GAP } from '../constant';
import ProductCard from '../components/ProductCard';
import ProductListBackdrop from '../components/ProductListBackdrop';
import ProductListHeader from '../components/ProductListHeader';
import ProductListHero from '../components/ProductListHero';
import ProductListStatus from '../components/ProductListStatus';
import ProductSearchField from '../components/ProductSearchField';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'Products'>;

/** Màn 10 — danh mục sản phẩm vay (dữ liệu thật từ `finora-loan`), vẽ theo mockup 26/09/2026. */
export default function ProductListScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useProducts();

  // Ô tìm kiếm chỉ là lựa chọn tạm trên màn này nên giữ state cục bộ.
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const toggleSearch = () => {
    // Đóng ô tìm thì bỏ luôn từ khoá để danh sách trở lại đầy đủ.
    if (searchOpen) setQuery('');
    setSearchOpen(!searchOpen);
  };
  const clearQuery = () => setQuery('');

  const firstLoad = loading && !data;
  // Giữ thứ tự ưu tiên cũ: có lỗi thì báo lỗi kèm nút thử lại, kể cả khi còn dữ
  // liệu cũ trong cache, thay vì lặng lẽ hiện danh sách có thể đã lỗi thời.
  const products = !firstLoad && !error && data ? filterProductsByName(data, query) : [];

  return (
    <ProductListBackdrop>
      <FlatList
        data={products}
        keyExtractor={product => String(product.id)}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => nav.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        ItemSeparatorComponent={CardGap}
        ListHeaderComponent={
          <View style={styles.top}>
            <ProductListHeader searchOpen={searchOpen} onToggleSearch={toggleSearch} />
            {/* Khi tìm kiếm thì cất phần đầu trang để kết quả nằm ngay dưới ô nhập,
                không bị bàn phím che mất. */}
            {searchOpen ? (
              <ProductSearchField value={query} onChangeText={setQuery} onClear={clearQuery} />
            ) : (
              <ProductListHero />
            )}
          </View>
        }
        ListEmptyComponent={
          <ProductListStatus
            loading={firstLoad}
            error={error}
            onRetry={reload}
            hasProducts={!!data?.length}
            query={query.trim()}
          />
        }
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.section },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && !!data}
            onRefresh={reload}
            tintColor={Colors.authPrimary}
            colors={[Colors.authPrimary]}
          />
        }
      />
    </ProductListBackdrop>
  );
}

function CardGap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, flexGrow: 1 },
  top: { gap: Spacing.lg, marginBottom: Spacing.xl },
  gap: { height: PRODUCT_CARD_GAP },
});
