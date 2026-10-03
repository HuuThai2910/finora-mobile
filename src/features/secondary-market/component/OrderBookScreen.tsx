import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/feedback';
import { WaveBackdrop } from '@/components/phone';
import { Icon } from '@/components/ui';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import type { WalletStackParamList } from '@/navigation/types';
import { FontFamily, Radius, Spacing, tabularNums } from '@/theme';
import type { OrderSide } from '@/types/orderBook';
import { formatDong } from '@/utils/format';
import { BOOK_MAX_WIDTH, BOOK_PADDING } from '../constant';
import { useLiveOrderBook } from '../hook/useLiveOrderBook';
import { asSentence } from '../format';
import { useCancelOrder, useMyPosition } from '../hook/useOrderBook';
import BookActionBar from './BookActionBar';
import BookCard from './BookCard';
import BookHeader from './BookHeader';
import BookPriceCard from './BookPriceCard';
import BookStatusCard from './BookStatusCard';
import DepthLadder from './DepthLadder';
import LiveBadge from './LiveBadge';
import PositionCard from './PositionCard';
import RecentTrades, { RECENT_TRADES_SHOWN } from './RecentTrades';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'OrderBook'>;
type Route = RouteProp<WalletStackParamList, 'OrderBook'>;

/**
 * Sổ lệnh của một khoản vay theo mockup 02/10. Nền sóng của trang chủ, thẻ giá cùng dáng thẻ ví có
 * robot cầm đồng xu, rồi sổ chia cột mua | giá khớp | bán, các lần khớp gần nhất và lệnh của tôi.
 * Hai nút Mua / Bán ghim đáy.
 *
 * Sổ tự cập nhật qua `useLiveOrderBook`; mỗi khi sổ đổi (có thể chính lệnh của tôi vừa khớp) thì
 * tải lại phần "của bạn" để số Note và trạng thái lệnh không lệch với sổ.
 */
export default function OrderBookScreen() {
  const nav = useNavigation<Nav>();
  const { listingId } = useRoute<Route>().params;
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, BOOK_MAX_WIDTH);
  const [viewportHeight, setViewportHeight] = useState(0);

  const book = useLiveOrderBook(listingId);
  const [tradesExpanded, setTradesExpanded] = useState(false);
  const position = useMyPosition(listingId);
  const reloadPosition = position.reload;
  const cancel = useCancelOrder(useCallback(() => reloadPosition(), [reloadPosition]));

  const sequence = book.data?.sequence;
  useEffect(() => {
    if (sequence !== undefined) reloadPosition();
  }, [sequence, reloadPosition]);

  // Quay về từ form đặt lệnh: lệnh bị từ chối không làm sổ đổi, nên tự tải lại phần "của bạn".
  // Bỏ lần focus đầu vì lúc mở màn dữ liệu vừa được tải.
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) reloadPosition();
      focusedOnce.current = true;
    }, [reloadPosition]),
  );

  const openForm = (side: OrderSide, price?: number) =>
    nav.navigate('PlaceBookOrder', { listingId, side, price });

  const explainNote = () =>
    Alert.alert(
      'Giá theo % dư nợ',
      'Mỗi Note là một phần của khoản vay. Giá là phần trăm số gốc người vay còn nợ trên Note đó: 98% nghĩa là trả 98% dư nợ gốc còn lại. Note còn nợ ít hơn mệnh giá thì tiền mỗi Note cũng ít hơn.',
    );

  const renderBody = () => {
    if (!book.data) {
      if (book.error) {
        return (
          <BookStatusCard
            icon="alert"
            danger
            title={book.error}
            hint="Kiểm tra kết nối mạng rồi thử lại."
            action={{ label: 'Thử lại', onPress: book.reload }}
          />
        );
      }
      return (
        <>
          <Skeleton height={170} radius={16} />
          <Skeleton height={360} radius={Radius.md} />
        </>
      );
    }
    const data = book.data;
    return (
      <>
        <BookPriceCard book={data} />
        {data.defaulted ? (
          <View style={styles.warning} accessibilityRole="alert">
            <Icon name="alert" size={20} color={Colors.tagRedText} />
            <Text style={styles.warningText}>
              {asSentence(data.defaultWarning ?? 'Khoản vay gốc đang nợ xấu')} Đặt lệnh trên sổ này cần xác nhận đã đọc cảnh báo.
            </Text>
          </View>
        ) : null}
        <BookCard
          title="Sổ lệnh"
          right={
            <Pressable
              onPress={explainNote}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Mỗi Note ${formatDong(data.noteDenomination)}. Giải thích giá theo phần trăm dư nợ`}
              style={styles.noteInfo}
            >
              <Text style={styles.noteInfoText} maxFontSizeMultiplier={1.3}>{`1 Note = ${formatDong(data.noteDenomination)}`}</Text>
              <Icon name="info" size={18} color={Colors.authMuted} />
            </Pressable>
          }
        >
          <DepthLadder bids={data.bids} asks={data.asks} lastTrade={data.lastTrade} onPick={openForm} />
          <View style={styles.hintRow}>
            <Icon name="info" size={16} color={Colors.authMuted} />
            <Text style={styles.hint}>Giá tính theo % dư nợ gốc. Chạm một mức giá để đặt lệnh ngược chiều ở đúng giá đó.</Text>
          </View>
        </BookCard>
        <BookCard
          title="Khớp gần đây"
          icon="clock"
          right={
            data.recentTrades.length > RECENT_TRADES_SHOWN ? (
              <Pressable
                onPress={() => setTradesExpanded(v => !v)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityState={{ expanded: tradesExpanded }}
                style={styles.link}
              >
                <Text style={styles.linkText} maxFontSizeMultiplier={1.3}>{tradesExpanded ? 'Thu gọn' : 'Xem tất cả'}</Text>
                <Icon name={tradesExpanded ? 'chevronUp' : 'chevronRight'} size={16} color={Colors.authPrimary} />
              </Pressable>
            ) : null
          }
        >
          <RecentTrades trades={data.recentTrades} expanded={tradesExpanded} />
        </BookCard>
        <BookCard title="Của bạn trên sổ này" icon="wallet">
          <PositionCard
            bare
            position={position.data}
            loading={position.loading}
            error={position.error}
            onCancel={cancel.cancel}
            cancelling={cancel.cancelling}
            cancelError={cancel.error}
          />
        </BookCard>
      </>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
      >
        <View style={{ width, minHeight: viewportHeight }}>
          <WaveBackdrop background={HOME_WAVES} width={width} />
          <View style={styles.content}>
            <BookHeader
              title={book.data ? `Khoản vay #${book.data.loanId}` : 'Sổ lệnh'}
              topInset={insets.top}
              right={<LiveBadge connection={book.connection} />}
            />
            {renderBody()}
          </View>
        </View>
      </ScrollView>
      {book.data ? <BookActionBar onOrder={side => openForm(side)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  scrollView: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.xl, paddingHorizontal: BOOK_PADDING, paddingBottom: Spacing.xxxl },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.redBg,
  },
  warningText: { flex: 1, fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
  noteInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32 },
  noteInfoText: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted, ...tabularNums },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: 2 },
  hint: { flex: 1, fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32 },
  linkText: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authPrimary },
});
