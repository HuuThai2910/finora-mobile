import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { IconSize } from '@/theme';
import { PHeader, Screen } from '@/components/phone';
import { Icon } from '@/components/ui';
import { EmptyState, ErrorState, LoadingScreen } from '@/components/feedback';
import type { MarketStackParamList } from '@/navigation/types';
import { useProducts } from '../hook/useProducts';
import ProductCard from './ProductCard';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'Products'>;

/** Màn 10 — danh mục sản phẩm vay (dữ liệu thật từ `finora-loan`). */
export default function ProductListScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, error, reload } = useProducts();

  return (
    <Screen onRefresh={reload} refreshing={loading && !!data}>
      <PHeader
        title="Sản phẩm vay"
        back
        right={<Icon name="search" size={IconSize.sm} color={Colors.ink2} />}
      />

      {loading && !data ? (
        <LoadingScreen cards={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState
          icon="grid"
          title="Chưa có sản phẩm nào đang mở"
          hint="Quay lại sau khi hệ thống kích hoạt sản phẩm mới."
        />
      ) : (
        data.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            onPress={() => nav.navigate('ProductDetail', { productId: p.id })}
          />
        ))
      )}
    </Screen>
  );
}
