import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_, tabularNums } from '@/theme';
import { Tag } from '@/components/ui';
import { formatVND } from '@/utils/format';
import type { NoteListing } from '@/types/invest';
import { STATUS_LABEL, STATUS_TONE } from '../constant';

interface Props {
  listing: NoteListing;
  onPress: () => void;
}

/**
 * Thẻ một Note đang treo bán.
 *
 * Nợ xấu hiển thị bằng **chữ và ký hiệu**, không chỉ bằng màu: người dùng không phân biệt được màu
 * vẫn phải nhận ra đây là Note rủi ro cao. Nhãn trợ năng cũng nói rõ để trình đọc màn hình đọc được.
 */
export default function NoteListingCard({ listing, onPress }: Props) {
  // Phần người mua được lợi về gốc. Giá luôn không vượt dư nợ nên số này không âm.
  const gain = listing.outstandingPrincipal - listing.askingPrice;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        `${listing.noteNumber}, giá ${formatVND(listing.askingPrice)}, `
        + `dư nợ gốc ${formatVND(listing.outstandingPrincipal)}, `
        + `lãi ${listing.annualRate}% một năm, còn ${listing.termMonths} tháng`
        + (listing.defaulted ? ', khoản vay gốc đang nợ xấu' : '')
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.head}>
        <Text style={styles.title}>{listing.noteNumber}</Text>
        <Tag tone={STATUS_TONE[listing.status]} small>
          {STATUS_LABEL[listing.status]}
        </Tag>
      </View>

      {listing.defaulted && (
        <Text style={styles.warning}>
          ⚠ {listing.defaultedReason ?? 'Khoản vay gốc đang nợ xấu'}
        </Text>
      )}

      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatVND(listing.askingPrice)}</Text>
        <Text style={styles.gain}>lợi {formatVND(gain)} về gốc</Text>
      </View>

      <View style={styles.foot}>
        <Text style={styles.meta}>Dư nợ {formatVND(listing.outstandingPrincipal)}</Text>
        <Text style={styles.meta}>
          {listing.annualRate}% · {listing.termMonths} tháng
          {listing.grade ? ` · hạng ${listing.grade}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
  },
  pressed: { opacity: 0.7 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: { ...Text_.bodyBold, color: Colors.ink, flexShrink: 1 },
  warning: {
    ...Text_.microBold,
    color: Colors.tagRedText,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  price: { ...Text_.title, color: Colors.ink, ...tabularNums },
  gain: { ...Text_.micro, color: Colors.tagGreenText },
  foot: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { ...Text_.micro, color: Colors.ink3 },
});
