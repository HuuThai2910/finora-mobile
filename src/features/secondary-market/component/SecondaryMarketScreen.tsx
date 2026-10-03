import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/feedback';
import { WaveBackdrop } from '@/components/phone';
import { NOTES_MARKET_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import type { WalletStackParamList } from '@/navigation/types';
import { Radius, Spacing } from '@/theme';
import { BOOK_MAX_WIDTH, BOOK_PADDING, MARKET_INTRO, NOTES_ART } from '../constant';
import { useOrderBooks } from '../hook/useOrderBook';
import BookHeader from './BookHeader';
import BookStatusCard from './BookStatusCard';
import BookSummaryCard from './BookSummaryCard';
import NotesFooter from './NotesFooter';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'SecondaryMarket'>;

/** Khoảng giữa chân linh vật và mép trên thẻ đầu tiên. */
const GROUND_GAP = Spacing.xs;

/**
 * Chợ Notes — danh sách khoản vay còn Note lưu hành, mỗi khoản một sổ lệnh. Đầu màn là hai linh
 * vật trao tay đồng xu (ảnh nền của ví, phóng to và canh phải), dưới là thẻ từng sổ với giá mua cao
 * nhất, giá bán thấp nhất và giá khớp gần nhất.
 */
export default function SecondaryMarketScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, BOOK_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để nền trơn phủ tới đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);
  const books = useOrderBooks();

  // Ảnh phóng `zoom` lần; quy chân linh vật ra toạ độ trên màn để thẻ đầu nằm ngay dưới. Đầu
  // linh vật thấp hơn hàng tiêu đề nên tiêu đề ngắn không cần né hình.
  const imageWidth = width * NOTES_MARKET_WAVES.zoom;
  const scale = imageWidth / NOTES_MARKET_WAVES.width;
  const headerHeight = NOTES_ART.bottom * scale + GROUND_GAP;

  const renderBooks = () => {
    if (books.loading && !books.data) {
      return [0, 1, 2].map(i => <Skeleton key={i} height={156} radius={Radius.md} />);
    }
    if (books.error) {
      return (
        <BookStatusCard
          icon="alert"
          danger
          title={books.error}
          hint="Kiểm tra kết nối mạng rồi thử lại."
          action={{ label: 'Thử lại', onPress: books.reload }}
        />
      );
    }
    if (!books.data?.length) {
      return <BookStatusCard icon="layers" title="Chưa có Note nào đang lưu hành" hint={MARKET_INTRO} />;
    }
    return books.data.map(book => (
      <BookSummaryCard
        key={book.listingId}
        book={book}
        onPress={() => nav.navigate('OrderBook', { listingId: book.listingId })}
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
          refreshing={books.loading && !!books.data}
          onRefresh={books.reload}
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={NOTES_MARKET_WAVES} width={width} />
        <View style={styles.content}>
          <BookHeader
            title="Chợ Notes"
            topInset={insets.top}
            minHeight={headerHeight}
          />
          <View style={styles.cards}>{renderBooks()}</View>
          <NotesFooter onMyOrders={() => nav.navigate('MyBookOrders')} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.walletHistoryFill },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.xl, paddingHorizontal: BOOK_PADDING, paddingBottom: 40 },
  cards: { gap: Spacing.lg },
});
