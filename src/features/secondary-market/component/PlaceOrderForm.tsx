import { Alert, StyleSheet, Text, View } from 'react-native';
import { Checkbox } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/theme';
import type { BookSnapshot, OrderSide } from '@/types/orderBook';
import { formatDong } from '@/utils/format';
import { asSentence, formatBookPrice } from '../format';
import type { useOrderForm } from '../hook/useOrderForm';
import OrderEstimate from './OrderEstimate';
import SideSwitch from './SideSwitch';
import StepperField from './StepperField';

/** Số nút chọn nhanh mỗi hàng: 5 nút vẫn đủ rộng cho "100,0%" trên máy 360pt. */
const QUICK_COUNT = 5;
const QUANTITY_PRESETS = [1, 5, 10, 20, 50];

type Props = {
  book: BookSnapshot;
  freeNotes: number | null;
  form: ReturnType<typeof useOrderForm>;
  submitError: string | null;
};

/**
 * Phần nhập của màn đặt lệnh: chiều, giá, số Note, số tiền tạm tính và ô xác nhận nợ xấu. Nút đặt
 * lệnh nằm ở vùng ghim đáy do màn quản lý, để không bị bàn phím che.
 */
export default function PlaceOrderForm({ book, freeNotes, form, submitError }: Props) {
  const buy = form.side === 'BID';

  // Mức giá chọn nhanh: các mức phía đối diện (khớp được ngay); phía đó trống thì các mức cùng
  // phía (xếp hàng chờ cạnh người khác). Xếp tăng dần như mockup.
  const opposite = buy ? book.asks : book.bids;
  const same = buy ? book.bids : book.asks;
  const priceQuick = (opposite.length ? opposite : same)
    .slice(0, QUICK_COUNT)
    .map(l => l.price)
    .sort((a, b) => a - b)
    .map(price => ({ label: formatBookPrice(price), onPress: () => form.setPrice(price), selected: form.price === price }));

  // Số Note chọn nhanh; lệnh bán không vượt số Note còn bán được, nút cuối là "bán hết".
  const quantityOptions = (() => {
    if (buy || freeNotes === null) return QUANTITY_PRESETS;
    if (freeNotes <= 0) return [];
    const below = QUANTITY_PRESETS.filter(q => q < freeNotes).slice(0, QUICK_COUNT - 1);
    return [...below, freeNotes];
  })();
  const quantityQuick = quantityOptions.map(q => ({
    label: String(q),
    onPress: () => form.setQuantity(q),
    selected: form.quantity === q,
  }));

  const denomination = `1 Note = ${formatDong(book.noteDenomination)}`;
  const quantityHint = !buy && freeNotes !== null
    ? `Bạn còn ${freeNotes} Note bán được. ${denomination}`
    : denomination;

  return (
    <View style={styles.root}>
      <SideSwitch value={form.side} onChange={(side: OrderSide) => form.setSide(side)} />

      <StepperField
        label="Giá, % dư nợ gốc"
        text={form.priceInput}
        onChangeText={form.setPriceInput}
        onStep={form.stepPrice}
        keyboard="decimal-pad"
        hint={buy ? 'Khớp ngay với người bán từ giá này trở xuống.' : 'Khớp ngay với người mua từ giá này trở lên.'}
        error={form.priceError}
        suffix="%"
        onInfo={() =>
          Alert.alert(
            'Giá theo % dư nợ gốc',
            'Giá là phần trăm số gốc người vay còn nợ trên mỗi Note. 98% nghĩa là trả 98% dư nợ gốc còn lại; 100% là trả đúng bằng dư nợ.',
          )
        }
        quick={priceQuick}
      />

      <StepperField
        label="Số Note"
        text={form.quantityInput}
        onChangeText={form.setQuantityInput}
        onStep={form.stepQuantity}
        keyboard="number-pad"
        hint={quantityHint}
        error={form.quantityError}
        onInfo={() =>
          Alert.alert(
            'Note là gì?',
            `Mỗi Note là một phần bằng nhau của khoản vay, mệnh giá ${formatDong(book.noteDenomination)}. Người giữ Note nhận gốc và lãi người vay trả theo phần đó.`,
          )
        }
        quick={quantityQuick}
      />

      <OrderEstimate
        side={form.side}
        price={form.price}
        quantity={form.quantity}
        referenceOutstanding={book.referenceOutstanding}
      />

      {book.defaulted ? (
        <View style={styles.default}>
          <Checkbox
            checked={form.acknowledged}
            onChange={form.setAcknowledged}
            label="Tôi đã đọc cảnh báo khoản vay đang nợ xấu"
          >
            <Text style={styles.defaultText}>
              {asSentence(book.defaultWarning ?? 'Khoản vay gốc đang nợ xấu')} Tôi hiểu rủi ro và vẫn muốn đặt lệnh.
            </Text>
          </Checkbox>
        </View>
      ) : null}

      {submitError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {submitError}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xl },
  default: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: Radius.md, backgroundColor: Colors.redBg },
  defaultText: { fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
  error: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.redBg,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.tagRedText,
  },
});
