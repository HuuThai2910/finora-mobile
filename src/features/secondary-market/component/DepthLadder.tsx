import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, tabularNums } from '@/theme';
import type { OrderSide, PriceLevel } from '@/types/orderBook';
import { LADDER_DEPTH } from '../constant';
import { formatBookPrice, roundPrice } from '../format';

type Props = {
  bids: PriceLevel[];
  asks: PriceLevel[];
  lastTrade: number | null;
  /** Chạm một mức giá: mở form với chiều ngược lại ở đúng giá đó (chạm giá bán là để mua). */
  onPick: (side: OrderSide, price: number) => void;
};

/** Ít nhất chừng này dòng mỗi cột, để phía trống vẫn đủ chỗ cho lời giải thích. */
const MIN_ROWS = 3;
/** Dòng cao 40pt: vừa đủ vùng chạm khi cộng khoảng cách, mà 5 dòng vẫn gọn trong một màn. */
const ROW_HEIGHT = 40;
/** Cột giữa chỉ chứa vài chữ ngắn, giữ hẹp để hai cột giá đủ rộng trên máy 360pt. */
const MIDDLE_WIDTH = 62;

/**
 * Sổ lệnh chia ba cột theo mockup 02/10: bên mua bên trái, bên bán bên phải, cột giữa là giá khớp
 * gần nhất và chênh lệch. Mỗi cột xếp giá tốt nhất lên đầu, nên hai giá sát nhau nhất nằm cùng
 * hàng trên cùng, hai bên cột giữa.
 *
 * Thanh nhạt giữa giá và số Note dài theo số Note ở mức đó so với mức lớn nhất trên cả hai cột.
 * Mỗi cột có nhãn chữ "Bên mua"/"Bên bán", không để màu là tín hiệu duy nhất.
 */
export default function DepthLadder({ bids, asks, lastTrade, onPick }: Props) {
  const shownBids = bids.slice(0, LADDER_DEPTH);
  const shownAsks = asks.slice(0, LADDER_DEPTH);
  const rows = Math.max(MIN_ROWS, shownBids.length, shownAsks.length);
  const maxQuantity = Math.max(1, ...shownBids.map(l => l.quantity), ...shownAsks.map(l => l.quantity));

  return (
    <View style={styles.columns}>
      <SideColumn side="BID" levels={shownBids} rows={rows} maxQuantity={maxQuantity} onPick={onPick} />
      <Middle lastTrade={lastTrade} bestBid={bids[0]?.price ?? null} bestAsk={asks[0]?.price ?? null} />
      <SideColumn side="ASK" levels={shownAsks} rows={rows} maxQuantity={maxQuantity} onPick={onPick} />
    </View>
  );
}

function SideColumn({
  side,
  levels,
  rows,
  maxQuantity,
  onPick,
}: {
  side: OrderSide;
  levels: PriceLevel[];
  rows: number;
  maxQuantity: number;
  onPick: Props['onPick'];
}) {
  const isBid = side === 'BID';
  const color = isBid ? Colors.bookBid : Colors.bookAsk;
  const blanks = Math.max(0, rows - levels.length);

  return (
    <View style={[styles.side, { backgroundColor: isBid ? Colors.bookBidColumn : Colors.bookAskColumn }]}>
      <View style={[styles.sideHead, { backgroundColor: isBid ? Colors.bookBidBar : Colors.bookAskBar }]}>
        <Text style={[styles.sideTitle, { color }]} maxFontSizeMultiplier={1.3}>{isBid ? 'Bên mua' : 'Bên bán'}</Text>
      </View>
      <View style={styles.columnLabels}>
        <Text style={styles.columnLabel} maxFontSizeMultiplier={1.2}>Giá</Text>
        <Text style={styles.columnLabel} maxFontSizeMultiplier={1.2}>Số Note</Text>
      </View>

      <View>
        {levels.map(level => (
          <LadderRow key={level.price} side={side} level={level} maxQuantity={maxQuantity} onPick={onPick} />
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <View key={`blank${i}`} style={styles.row} importantForAccessibility="no-hide-descendants">
            <Text style={styles.dash}>–</Text>
            <Text style={styles.dash}>–</Text>
          </View>
        ))}
        {levels.length === 0 ? (
          <View style={styles.emptyOverlay} pointerEvents="none">
            <View style={styles.emptyIcon}>
              <Icon name="fileText" size={20} color={Colors.chevronMuted} />
            </View>
            <Text style={styles.emptyText} maxFontSizeMultiplier={1.3}>
              {isBid ? 'Chưa có lệnh mua nào' : 'Chưa có lệnh bán nào'}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function LadderRow({
  side,
  level,
  maxQuantity,
  onPick,
}: {
  side: OrderSide;
  level: PriceLevel;
  maxQuantity: number;
  onPick: Props['onPick'];
}) {
  const isAsk = side === 'ASK';
  const price = formatBookPrice(level.price);
  const share: `${number}%` = `${Math.max(8, Math.round((level.quantity / maxQuantity) * 100))}%`;

  return (
    <Pressable
      onPress={() => onPick(isAsk ? 'BID' : 'ASK', level.price)}
      accessibilityRole="button"
      accessibilityLabel={`${isAsk ? 'Bán' : 'Mua'} ${level.quantity} Note giá ${price}, ${level.orderCount} lệnh`}
      accessibilityHint={isAsk ? 'Đặt lệnh mua ở giá này' : 'Đặt lệnh bán ở giá này'}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={[styles.price, { color: isAsk ? Colors.bookAsk : Colors.bookBid }]} maxFontSizeMultiplier={1.2}>
        {price}
      </Text>
      <View style={styles.track}>
        <View style={[styles.bar, { width: share, backgroundColor: isAsk ? Colors.bookAskBar : Colors.bookBidBar }]} />
      </View>
      <Text style={styles.quantity} maxFontSizeMultiplier={1.2}>{level.quantity}</Text>
    </Pressable>
  );
}

/** Cột giữa: giá khớp gần nhất, rồi hai phía còn cách nhau bao xa. */
function Middle({ lastTrade, bestBid, bestAsk }: { lastTrade: number | null; bestBid: number | null; bestAsk: number | null }) {
  const spread = bestBid != null && bestAsk != null ? formatBookPrice(roundPrice(bestAsk - bestBid)) : null;
  return (
    <View style={styles.middle}>
      <Text style={styles.middleLabel} maxFontSizeMultiplier={1.2}>Giá khớp gần nhất</Text>
      {lastTrade == null ? (
        <>
          <Text style={styles.middleValue} maxFontSizeMultiplier={1.2}>–</Text>
          <Text style={styles.middleNote} maxFontSizeMultiplier={1.2}>Chưa có giao dịch</Text>
        </>
      ) : (
        <Text style={styles.middleValue} maxFontSizeMultiplier={1.2}>{formatBookPrice(lastTrade)}</Text>
      )}
      {spread ? (
        <View style={styles.spread}>
          <Text style={styles.middleLabel} maxFontSizeMultiplier={1.2}>Chênh lệch</Text>
          <Text style={styles.spreadValue} maxFontSizeMultiplier={1.2}>{spread}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 6 },
  side: { flex: 1, minWidth: 0, borderRadius: 12, paddingBottom: 4, overflow: 'hidden' },
  sideHead: { alignItems: 'center', paddingVertical: 7, borderRadius: 12 },
  sideTitle: { fontFamily: FontFamily.bold, fontSize: 13, lineHeight: 18 },
  columnLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 2 },
  columnLabel: { fontFamily: FontFamily.medium, fontSize: 11, lineHeight: 15, color: Colors.authMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ROW_HEIGHT,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  rowPressed: { backgroundColor: Colors.tintBlue },
  price: { fontFamily: FontFamily.bold, fontSize: 14, lineHeight: 20, ...tabularNums },
  // Thanh mọc từ cạnh giá về phía số Note, như mockup.
  track: { flex: 1, height: 18, marginHorizontal: 6 },
  bar: { height: '100%', borderRadius: 5 },
  quantity: { minWidth: 14, textAlign: 'right', fontFamily: FontFamily.bold, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
  dash: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.chevronMuted },
  // Lời giải thích nằm giữa các dòng gạch của phía trống; hai gạch ở sát mép nên chữ không đè lên.
  emptyOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 18,
    right: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  emptyText: { textAlign: 'center', fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  middle: {
    width: MIDDLE_WIDTH,
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: Colors.bookSpread,
  },
  middleLabel: { textAlign: 'center', fontFamily: FontFamily.semibold, fontSize: 11, lineHeight: 15, color: Colors.authMuted },
  middleValue: { marginTop: 8, fontFamily: FontFamily.extrabold, fontSize: 15, lineHeight: 21, color: Colors.authInk, ...tabularNums },
  middleNote: { marginTop: 4, textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 11, lineHeight: 15, color: Colors.authMuted },
  spread: { alignItems: 'center', marginTop: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.authBorder, alignSelf: 'stretch' },
  spreadValue: { marginTop: 4, fontFamily: FontFamily.bold, fontSize: 13, lineHeight: 18, color: Colors.authInk, ...tabularNums },
});
