import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing, tabularNums } from '@/theme';
import type { TradeTick } from '@/types/orderBook';
import { formatTime } from '@/utils/format';
import { formatBookPrice } from '../format';

/** Số giao dịch hiện khi thu gọn; backend gửi tối đa 20, "Xem tất cả" mở hết. */
export const RECENT_TRADES_SHOWN = 6;

/**
 * Các lần khớp gần nhất. Nhãn "Mua"/"Bán" là bên chủ động — người vừa đặt lệnh chạm vào lệnh đang
 * nằm chờ — giúp đoán thị trường đang nghiêng về phía nào. Thẻ bao ngoài và nút "Xem tất cả" do
 * màn sổ lệnh dựng (`BookCard`).
 */
export default function RecentTrades({ trades, expanded }: { trades: TradeTick[]; expanded: boolean }) {
  if (trades.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.art} importantForAccessibility="no-hide-descendants">
          <View style={styles.sheet}>
            <View style={[styles.line, { width: 30 }]} />
            <View style={[styles.line, { width: 22 }]} />
            <View style={[styles.line, { width: 26 }]} />
          </View>
          <View style={styles.lens}>
            <Icon name="search" size={26} color={Colors.authPrimary} strokeWidth={2.6} />
          </View>
        </View>
        <Text style={styles.emptyTitle} maxFontSizeMultiplier={1.4}>Chưa có giao dịch nào</Text>
        <Text style={styles.emptyHint} maxFontSizeMultiplier={1.4}>Các lần khớp gần nhất sẽ hiện ở đây.</Text>
      </View>
    );
  }

  const shown = expanded ? trades : trades.slice(0, RECENT_TRADES_SHOWN);
  return (
    <View>
      {shown.map((t, i) => {
        const buy = t.aggressor === 'BID';
        return (
          <View
            key={`${t.executedAt}-${i}`}
            style={[styles.row, i > 0 && styles.divider]}
            accessible
            accessibilityLabel={`${formatTime(t.executedAt)}, ${buy ? 'bên mua' : 'bên bán'} khớp ${t.quantity} Note giá ${formatBookPrice(t.price)}`}
          >
            <Text style={styles.time} maxFontSizeMultiplier={1.3}>{formatTime(t.executedAt)}</Text>
            <View style={[styles.side, { backgroundColor: buy ? Colors.bookBidBar : Colors.bookAskBar }]}>
              <Text style={[styles.sideText, { color: buy ? Colors.bookBid : Colors.bookAsk }]} maxFontSizeMultiplier={1.3}>
                {buy ? 'Mua' : 'Bán'}
              </Text>
            </View>
            <Text style={styles.price} maxFontSizeMultiplier={1.3}>{formatBookPrice(t.price)}</Text>
            <Text style={styles.quantity} maxFontSizeMultiplier={1.3}>{`${t.quantity} Note`}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.bookSpread,
  },
  // Hình minh hoạ vẽ bằng khối: tờ danh sách trống và kính lúp, cùng tông xanh của app.
  art: { width: 84, height: 64, marginBottom: Spacing.md },
  sheet: {
    position: 'absolute',
    left: 6,
    top: 4,
    width: 52,
    height: 56,
    gap: 7,
    paddingTop: 12,
    paddingLeft: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.authBorder,
  },
  line: { height: 5, borderRadius: 3, backgroundColor: Colors.tintBlue },
  lens: {
    position: 'absolute',
    right: 4,
    bottom: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tintBlue,
  },
  emptyTitle: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 22, color: Colors.authInk },
  emptyHint: { marginTop: 2, textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 44, paddingHorizontal: 2 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  time: { width: 44, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted, ...tabularNums },
  side: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 2 },
  sideText: { fontFamily: FontFamily.bold, fontSize: 12, lineHeight: 17 },
  price: { flex: 1, fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk, ...tabularNums },
  quantity: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted, ...tabularNums },
});
