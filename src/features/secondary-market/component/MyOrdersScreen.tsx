import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/feedback';
import { WaveBackdrop } from '@/components/phone';
import { CONTRACTS_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import type { WalletStackParamList } from '@/navigation/types';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import { BOOK_MAX_WIDTH, BOOK_PADDING, MY_ORDERS_ART } from '../constant';
import { useCancelOrder, useMyOrders } from '../hook/useOrderBook';
import BookHeader from './BookHeader';
import BookStatusCard from './BookStatusCard';
import OrderRow from './OrderRow';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'MyBookOrders'>;

const FILTERS = [
  { active: true, label: 'Đang chờ khớp' },
  { active: false, label: 'Tất cả' },
] as const;

/**
 * Lệnh của tôi trên mọi sổ. Nền là hai linh vật cầm giấy tờ của màn "Hợp đồng của tôi"; dưới
 * hình là hai chip lọc, rồi một thẻ trắng liệt kê lệnh, mỗi dòng có nút huỷ khi lệnh còn chờ khớp.
 */
export default function MyOrdersScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, BOOK_MAX_WIDTH);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [activeOnly, setActiveOnly] = useState(true);

  const orders = useMyOrders(activeOnly);
  const cancel = useCancelOrder(useCallback(() => orders.reload(), [orders.reload]));
  const headerHeight = MY_ORDERS_ART.bottom * (width / CONTRACTS_WAVES.width);

  const renderList = () => {
    if (orders.loading && !orders.data) return <Skeleton height={220} radius={Radius.md} />;
    if (orders.error) {
      return (
        <BookStatusCard
          icon="alert"
          danger
          title={orders.error}
          hint="Kiểm tra kết nối mạng rồi thử lại."
          action={{ label: 'Thử lại', onPress: orders.reload }}
        />
      );
    }
    if (!orders.data?.length) {
      return (
        <BookStatusCard
          icon="receipt"
          title={activeOnly ? 'Không có lệnh nào đang chờ khớp' : 'Bạn chưa đặt lệnh nào'}
          hint="Mở một khoản vay trên chợ Notes rồi bấm Mua hoặc Bán."
          action={{ label: 'Mở chợ Notes', onPress: () => nav.navigate('SecondaryMarket') }}
        />
      );
    }
    return (
      <View style={styles.card}>
        {orders.data.map((order, i) => (
          <Pressable
            key={order.reference}
            onPress={() => nav.navigate('OrderBook', { listingId: order.listingId })}
            accessibilityHint="Mở sổ lệnh của khoản vay này"
          >
            <OrderRow
              order={order}
              first={i === 0}
              loanLabel={order.loanId != null ? `Khoản vay #${order.loanId}` : undefined}
              onCancel={cancel.cancel}
              cancelling={cancel.cancelling === order.reference}
            />
          </Pressable>
        ))}
        {cancel.error ? <Text style={styles.error}>{cancel.error}</Text> : null}
      </View>
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
          refreshing={orders.loading && !!orders.data}
          onRefresh={orders.reload}
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={CONTRACTS_WAVES} width={width} />
        <View style={styles.content}>
          <BookHeader title="Lệnh của tôi" topInset={insets.top} minHeight={headerHeight} />
          <View style={styles.filters} accessibilityRole="radiogroup" accessibilityLabel="Lọc lệnh">
            {FILTERS.map(f => {
              const selected = f.active === activeOnly;
              return (
                <Pressable
                  key={f.label}
                  onPress={() => setActiveOnly(f.active)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={f.label}
                  hitSlop={{ top: 6, bottom: 6 }}
                  style={({ pressed }) => [styles.chip, selected && styles.chipActive, pressed && styles.pressed]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]} maxFontSizeMultiplier={1.3}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {renderList()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.contractsFill },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.lg, paddingHorizontal: BOOK_PADDING, paddingBottom: 40 },
  filters: { flexDirection: 'row', gap: Spacing.md },
  chip: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { borderColor: Colors.authPrimary, backgroundColor: Colors.tintBlue },
  pressed: { opacity: 0.7 },
  chipText: { fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  chipTextActive: { fontFamily: FontFamily.semibold, color: Colors.authPrimary },
  card: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  error: { paddingVertical: Spacing.md, fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
});
