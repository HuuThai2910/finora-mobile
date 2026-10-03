import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { OrderSide } from '@/types/orderBook';
import { formatDong } from '@/utils/format';
import { BUY_NOTE, ESTIMATE_MASCOT, FEE_RATE_PERCENT, SELL_NOTE } from '../constant';
import { estimateOrder } from '../format';

const MASCOT_HEIGHT = 92;
const MASCOT_WIDTH = Math.round((MASCOT_HEIGHT * 480) / 459);

type Props = {
  side: OrderSide;
  price: number | null;
  quantity: number | null;
  referenceOutstanding: number | null;
};

/**
 * Số tiền tạm tính dưới form. Mua: số tiền sẽ bị giữ tạm (mức trần). Bán: tiền bán, phí và số thực
 * nhận. Ghi rõ "tạm tính" vì số chính thức do hệ thống chốt lúc giữ tiền và lúc khớp.
 *
 * Theo mockup 02/10: robot cầm đồng xu đứng góc dưới-phải, cạnh lời giải thích, trên nền xanh nhạt
 * dần ở đáy thẻ; các dòng số nằm phía trên nên robot không che con số nào.
 */
export default function OrderEstimate({ side, price, quantity, referenceOutstanding }: Props) {
  const buy = side === 'BID';
  const ready = price !== null && quantity !== null && referenceOutstanding !== null;
  const estimate = ready ? estimateOrder(referenceOutstanding, price, quantity) : null;

  const rows = !estimate
    ? []
    : buy
      ? [{ label: 'Giữ tạm trong ví, tối đa', value: formatDong(estimate.gross), strong: true }]
      : [
          { label: 'Tiền bán', value: formatDong(estimate.gross), strong: false },
          { label: `Phí nền tảng ${FEE_RATE_PERCENT}%`, value: `−${formatDong(estimate.fee)}`, strong: false },
          { label: 'Bạn nhận khoảng', value: formatDong(estimate.net), strong: true },
        ];

  const explain = () =>
    Alert.alert(
      buy ? 'Vì sao giữ tạm tiền?' : 'Số tiền bán',
      buy
        ? 'Đặt lệnh mua thì số tiền này được giữ trong ví để bảo đảm lệnh khớp được. Đây là mức tối đa theo dư nợ hiện tại; khớp ở giá thấp hơn hoặc huỷ lệnh thì phần thừa trả lại ví.'
        : `Tiền bán = giá × dư nợ gốc còn lại × số Note. FINORA trừ phí ${FEE_RATE_PERCENT}% lúc khớp; số chính thức chốt khi lệnh khớp.`,
    );

  return (
    <View style={styles.card}>
      <LinearGradient colors={[Colors.productsBackdropClear, Colors.tintBlue]} style={styles.ground} pointerEvents="none" />
      <Text style={styles.title} maxFontSizeMultiplier={1.4}>Tạm tính</Text>
      {estimate ? (
        rows.map(r => (
          <View key={r.label} style={styles.row}>
            <View style={styles.labelBox}>
              <Text style={[styles.label, r.strong && styles.labelStrong]} maxFontSizeMultiplier={1.4}>{r.label}</Text>
              {r.strong ? (
                <Pressable onPress={explain} hitSlop={10} accessibilityRole="button" accessibilityLabel="Giải thích số tạm tính">
                  <Icon name="info" size={16} color={Colors.authMuted} />
                </Pressable>
              ) : null}
            </View>
            <Text
              style={[styles.value, r.strong && { color: buy ? Colors.bookBid : Colors.authInk }, r.strong && styles.valueStrong]}
              maxFontSizeMultiplier={1.3}
            >
              {r.value}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.note}>Nhập giá và số Note hợp lệ để xem số tiền.</Text>
      )}
      <View style={styles.noteRow}>
        <Text style={styles.note}>{buy ? BUY_NOTE : SELL_NOTE}</Text>
        <Image
          source={ESTIMATE_MASCOT}
          resizeMode="contain"
          style={styles.mascot}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    paddingBottom: 0,
    overflow: 'hidden',
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  title: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.md },
  labelBox: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { flexShrink: 1, fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  labelStrong: { fontFamily: FontFamily.semibold, color: Colors.authInk },
  value: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authInk, ...tabularNums },
  valueStrong: { fontFamily: FontFamily.extrabold, fontSize: 18, lineHeight: 25 },
  // Lời giải thích chừa bên phải cho robot; dòng đủ cao để robot đứng sát đáy thẻ.
  noteRow: { minHeight: MASCOT_HEIGHT, paddingRight: MASCOT_WIDTH - 4, paddingBottom: Spacing.lg },
  mascot: { position: 'absolute', right: -6, bottom: 0, width: MASCOT_WIDTH, height: MASCOT_HEIGHT },
  ground: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 56 },
  note: { marginTop: 2, fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 18, color: Colors.authMuted },
});
