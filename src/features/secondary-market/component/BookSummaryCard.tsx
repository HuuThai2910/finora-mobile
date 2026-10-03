import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { BookSummary } from '@/types/orderBook';
import { formatBookPrice, formatDenomination } from '../format';
import GradePill from './GradePill';

/** Ô biểu tượng tròn cùng cỡ thẻ khoản vay trên Sàn. */
const TILE = 44;

/**
 * Một khoản vay trên chợ Notes: mã, hạng và lãi suất, rồi ba con số người mua bán nhìn đầu tiên —
 * giá mua cao nhất, giá bán thấp nhất, giá khớp gần nhất. Cả thẻ là nút mở sổ lệnh.
 */
export default function BookSummaryCard({ book, onPress }: { book: BookSummary; onPress: () => void }) {
  const quotes = [
    { label: 'Mua cao nhất', value: book.bestBid, color: Colors.bookBid },
    { label: 'Bán thấp nhất', value: book.bestAsk, color: Colors.bookAsk },
    { label: 'Khớp gần nhất', value: book.lastTrade, color: Colors.authInk },
  ];
  const spoken = quotes
    .map(q => `${q.label} ${q.value == null ? 'chưa có' : formatBookPrice(q.value)}`)
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Khoản vay ${book.loanId}${book.defaulted ? ', đang nợ xấu' : ''}, ${spoken}`}
      accessibilityHint="Mở sổ lệnh của khoản vay"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={styles.tile}>
          <Icon name="layers" size={22} color={Colors.authPrimary} />
        </View>
        {/* Viên hạng nằm cùng hàng tên khoản vay; dòng kỳ hạn bên dưới dùng trọn bề ngang
            nên không bị viên hạng ép xuống dòng trên máy hẹp. */}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.title} maxFontSizeMultiplier={1.4}>{`Khoản vay #${book.loanId}`}</Text>
            <GradePill grade={book.grade} annualRate={book.annualRate} />
          </View>
          <View style={styles.meta}>
            <Icon name="clock" size={14} color={Colors.authMuted} />
            <Text style={styles.metaText} maxFontSizeMultiplier={1.4}>
              {`${book.termMonths} tháng, mỗi Note ${formatDenomination(book.noteDenomination)}`}
            </Text>
          </View>
        </View>
      </View>

      {book.defaulted ? (
        <View style={styles.defaulted}>
          <Icon name="alert" size={14} color={Colors.tagRedText} />
          <Text style={styles.defaultedText} maxFontSizeMultiplier={1.4}>Khoản vay đang nợ xấu</Text>
        </View>
      ) : null}

      <View style={styles.quotes}>
        {quotes.map(q => (
          <View key={q.label} style={styles.quote}>
            <Text style={styles.quoteLabel} maxFontSizeMultiplier={1.3}>{q.label}</Text>
            <Text style={[styles.quoteValue, { color: q.value == null ? Colors.chevronMuted : q.color }]} maxFontSizeMultiplier={1.3}>
              {q.value == null ? '—' : formatBookPrice(q.value)}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.72 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: TILE / 2,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  title: { flexShrink: 1, fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaText: { flexShrink: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  defaulted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.redBg,
  },
  defaultedText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, color: Colors.tagRedText },
  // Ba ô giá chung một nền nhạt, chia đều bề ngang như hàng số liệu của thẻ ví.
  quotes: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.scheduleTile,
  },
  quote: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  quoteLabel: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted, textAlign: 'center' },
  quoteValue: { marginTop: 2, fontFamily: FontFamily.bold, fontSize: 17, lineHeight: 24, ...tabularNums },
});
