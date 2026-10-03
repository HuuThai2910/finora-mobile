import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/feedback';
import { WaveBackdrop } from '@/components/phone';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { useAsync } from '@/hooks/useAsync';
import type { WalletStackParamList } from '@/navigation/types';
import { Radius, Spacing } from '@/theme';
import type { BookOrder, BookPosition, BookSnapshot, OrderSide } from '@/types/orderBook';
import { getOrderBook } from '../api';
import { BOOK_MAX_WIDTH, BOOK_PADDING } from '../constant';
import { useMyPosition, usePlaceOrder } from '../hook/useOrderBook';
import { useOrderForm } from '../hook/useOrderForm';
import { SideButton } from './BookActionBar';
import BookHeader from './BookHeader';
import BookStatusCard from './BookStatusCard';
import OrderResult from './OrderResult';
import PinnedBar from './PinnedBar';
import PlaceOrderForm from './PlaceOrderForm';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'PlaceBookOrder'>;
type Route = RouteProp<WalletStackParamList, 'PlaceBookOrder'>;

/**
 * Giá gợi ý khi mở form mà người dùng chưa chạm mức giá nào trên thang: mua thì lấy giá bán tốt
 * nhất (khớp được ngay), bán thì lấy giá mua tốt nhất; sổ trống thì lấy giá khớp gần nhất, cuối
 * cùng là 100% — mức trần, người dùng tự hạ.
 */
function suggestedPrice(book: BookSnapshot, side: OrderSide): number {
  const sameSideFirst = side === 'BID' ? [book.bestAsk, book.bestBid] : [book.bestBid, book.bestAsk];
  return [...sameSideFirst, book.lastTrade].find((p): p is number => p != null) ?? 100;
}

/**
 * Đặt lệnh mua hoặc bán trên một sổ. Mở từ nút Mua/Bán (giá gợi ý) hoặc từ một mức giá trên thang
 * (giá đúng mức đó). Đặt xong thì thay form bằng kết quả: lệnh khớp hết, khớp một phần hay đang chờ.
 */
export default function PlaceOrderScreen() {
  const { listingId, side, price } = useRoute<Route>().params;
  const book = useAsync(signal => getOrderBook(listingId, signal), [listingId]);
  const position = useMyPosition(listingId);
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, BOOK_MAX_WIDTH);

  const renderBody = () => {
    if (book.data) {
      return (
        <OrderEntry
          book={book.data}
          position={position.data}
          initialSide={side}
          initialPrice={price ?? suggestedPrice(book.data, side)}
          width={width}
          topInset={insets.top}
        />
      );
    }
    return (
      <Frame width={width} topInset={insets.top}>
        {book.error ? (
          <BookStatusCard
            icon="alert"
            danger
            title={book.error}
            hint="Kiểm tra kết nối mạng rồi thử lại."
            action={{ label: 'Thử lại', onPress: book.reload }}
          />
        ) : (
          <>
            <Skeleton height={52} radius={Radius.pill} />
            <Skeleton height={120} radius={Radius.md} />
            <Skeleton height={120} radius={Radius.md} />
          </>
        )}
      </Frame>
    );
  };

  return <View style={styles.root}>{renderBody()}</View>;
}

type EntryProps = {
  book: BookSnapshot;
  position: BookPosition | null;
  initialSide: OrderSide;
  initialPrice: number;
  width: number;
  topInset: number;
};

function OrderEntry({ book, position, initialSide, initialPrice, width, topInset }: EntryProps) {
  const nav = useNavigation<Nav>();
  const form = useOrderForm({
    side: initialSide,
    initialPrice,
    freeNotes: position?.freeNotes ?? null,
    defaulted: book.defaulted,
  });
  const placing = usePlaceOrder(book.listingId);
  const [result, setResult] = useState<BookOrder | null>(null);

  const submit = async () => {
    const order = await placing.submit(form.input());
    if (order) setResult(order);
  };

  if (result) {
    return (
      <Frame width={width} topInset={topInset} title="Kết quả đặt lệnh">
        <OrderResult order={result} onBackToBook={() => nav.goBack()} onPlaceAnother={() => setResult(null)} />
      </Frame>
    );
  }

  const buy = form.side === 'BID';
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Frame width={width} topInset={topInset} title={buy ? 'Đặt lệnh mua' : 'Đặt lệnh bán'} subtitle={`Khoản vay #${book.loanId}`}>
        <PlaceOrderForm book={book} freeNotes={position?.freeNotes ?? null} form={form} submitError={placing.error} />
      </Frame>
      <PinnedBar>
        <SideButton
          label={buy ? 'Đặt lệnh mua' : 'Đặt lệnh bán'}
          onPress={() => void submit()}
          disabled={!form.valid}
          loading={placing.submitting}
        />
      </PinnedBar>
    </KeyboardAvoidingView>
  );
}

/** Khung cuộn chung: nền sóng trang chủ, đầu màn, nội dung theo cột cỡ điện thoại. */
function Frame({
  width,
  topInset,
  title = 'Đặt lệnh',
  subtitle,
  children,
}: {
  width: number;
  topInset: number;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [viewportHeight, setViewportHeight] = useState(0);
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={HOME_WAVES} width={width} />
        <View style={styles.content}>
          <BookHeader title={title} subtitle={subtitle} topInset={topInset} />
          {children}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.xl, paddingHorizontal: BOOK_PADDING, paddingBottom: Spacing.xxxl },
});
