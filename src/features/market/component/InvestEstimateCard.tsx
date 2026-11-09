import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import { formatAnnualRateShort, formatDong, formatPercentValue } from '@/utils/format';
import { ESTIMATE_MASCOT, INVEST_NOTE } from '../constant';
import type { InvestEstimate } from '../investRules';

const MASCOT_HEIGHT = 92;
const MASCOT_WIDTH = Math.round((MASCOT_HEIGHT * 480) / 459);

type Props = {
  amount: number;
  /** `null` khi số tiền chưa hợp lệ. */
  estimate: InvestEstimate | null;
  annualRate: number;
  termMonths: number;
  repaymentLabel: string;
  /** Mệnh giá mỗi phần vốn của khoản vay, cho câu giải thích "phần vốn" lần đầu người dùng gặp chữ này. */
  noteDenomination: number;
};

type Row = { label: string; value: string; tone?: 'gain' | 'strong'; onInfo?: () => void };

/**
 * Số tạm tính dưới ô số tiền, cùng dáng thẻ "Tạm tính" của form đặt lệnh: số phần vốn nhận, tỷ lệ trong
 * khoản vay, lãi dự kiến và số tiền sẽ bị giữ trong ví. Robot cầm đồng xu đứng góc dưới-phải cạnh
 * lời giải thích, các dòng số nằm phía trên nên robot không che con số nào.
 */
export default function InvestEstimateCard({ amount, estimate, annualRate, termMonths, repaymentLabel, noteDenomination }: Props) {
  const explainInterest = () =>
    Alert.alert(
      "Lãi dự kiến",
      `Ước tính theo số tiền bạn góp, lãi suất ${formatAnnualRateShort(annualRate)} và cách trả "${repaymentLabel}", nếu người vay trả đúng hạn ${termMonths} kỳ. Số thực nhận có thể thay đổi.`,
    );

  const rows: Row[] = !estimate
    ? []
    : [
        { label: 'Số phần vốn nhận', value: `${estimate.notes} phần vốn` },
        { label: 'Tỷ lệ trong khoản vay', value: formatPercentValue(estimate.sharePercent) },
        ...(estimate.interest !== null
          ? [{ label: `Lãi dự kiến ${termMonths} tháng`, value: `+${formatDong(estimate.interest)}`, tone: 'gain' as const, onInfo: explainInterest }]
          : []),
        { label: 'Giữ tạm trong ví', value: formatDong(amount), tone: 'strong' },
      ];

  return (
    <View style={styles.card}>
      <LinearGradient colors={[Colors.productsBackdropClear, Colors.tintBlue]} style={styles.ground} pointerEvents="none" />
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
        Tạm tính
      </Text>
      {rows.length ? (
        rows.map(row => (
          <View key={row.label} style={styles.row}>
            <View style={styles.labelBox}>
              <Text style={[styles.label, row.tone === 'strong' && styles.labelStrong]} maxFontSizeMultiplier={1.4}>
                {row.label}
              </Text>
              {row.onInfo ? (
                <Pressable onPress={row.onInfo} hitSlop={10} accessibilityRole="button" accessibilityLabel="Giải thích lãi dự kiến">
                  <Icon name="info" size={16} color={Colors.authMuted} />
                </Pressable>
              ) : null}
            </View>
            <Text
              style={[styles.value, row.tone === 'gain' && styles.valueGain, row.tone === 'strong' && styles.valueStrong]}
              maxFontSizeMultiplier={1.3}
            >
              {row.value}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.note}>Nhập số tiền hợp lệ để xem tạm tính.</Text>
      )}
      {/* Lần đầu người dùng gặp chữ "phần vốn" khi góp vốn: giải thích ngắn, mệnh giá lấy từ khoản vay. */}
      {noteDenomination > 0 ? (
        <Text style={styles.note}>
          {`Mỗi phần vốn ${formatDong(noteDenomination)} là một phần của khoản vay; bạn nhận gốc và lãi theo số phần vốn đang giữ và có thể chuyển nhượng cho nhà đầu tư khác.`}
        </Text>
      ) : null}
      <View style={styles.noteRow}>
        <Text style={styles.note}>{INVEST_NOTE}</Text>
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
  title: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk },
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.md },
  labelBox: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { flexShrink: 1, fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  labelStrong: { fontFamily: FontFamily.semibold, color: Colors.authInk },
  value: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authInk, ...tabularNums },
  // Tiền lãi về ví: xanh lá đậm (5,17:1 trên nền trắng) như số tiền vào ở lịch sử ví.
  valueGain: { fontFamily: FontFamily.bold, color: Colors.walletHistoryIn },
  valueStrong: { fontFamily: FontFamily.extrabold, fontSize: 18, lineHeight: 25 },
  // Lời giải thích chừa bên phải cho robot; dòng đủ cao để robot đứng sát đáy thẻ.
  noteRow: { minHeight: MASCOT_HEIGHT, paddingRight: MASCOT_WIDTH - 4, paddingBottom: Spacing.lg },
  mascot: { position: 'absolute', right: -6, bottom: 0, width: MASCOT_WIDTH, height: MASCOT_HEIGHT },
  ground: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 56 },
  note: { marginTop: 2, fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 18, color: Colors.authMuted },
});
