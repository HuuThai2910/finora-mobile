import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, tabularNums } from '@/theme';
import type { PortfolioSummary } from '@/types/invest';
import { formatDong, formatPercentValue } from '@/utils/format';
import { PORTFOLIO_MASCOT } from '../constant';

/**
 * Thẻ tổng quan danh mục, cùng dáng thẻ ví ở trang chủ: nền xanh đậm dần, robot cầm đồng xu ở
 * góc phải. Con số lớn là vốn đang nằm trong các Note; hàng dưới là ba con số người đầu tư hỏi
 * tiếp theo — lãi suất bình quân, đã nhận về bao nhiêu, và đang chờ giải ngân bao nhiêu.
 */
/** Bề rộng thẻ trong mockup (màn 393pt trừ lề hai bên). */
const DESIGN_WIDTH = 361;

/**
 * Số vốn và mascot nằm cạnh nhau trên một hàng, nên cỡ chữ co theo bề rộng thẻ như thẻ ví trang
 * chủ: máy hẹp vẫn thấy đủ số tiền mà không đè lên robot. Chặn hai đầu để máy tính bảng không phóng
 * chữ quá to.
 */
const unitFor = (width: number) => Math.min(1.1, Math.max(0.8, width / DESIGN_WIDTH));

export default function PortfolioHeroCard({ summary, width }: { summary: PortfolioSummary; width: number }) {
  const invested = formatDong(summary.investedAmount);
  const u = unitFor(width);
  const valueSize = { fontSize: Math.round(28 * u), lineHeight: Math.round(36 * u) };
  const stats = [
    { label: 'Lãi suất bình quân', value: `${formatPercentValue(summary.averageRate)}/năm` },
    { label: 'Đã nhận về', value: formatDong(summary.totalReceived) },
    { label: 'Chờ giải ngân', value: formatDong(summary.pendingAmount) },
  ];

  return (
    <LinearGradient
      colors={[Colors.walletFrom, Colors.walletVia, Colors.walletTo]}
      // Tối ở góc dưới-trái nơi có chữ, sáng dần lên góc trên-phải nơi chỉ có mascot.
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.card}
    >
      <Image
        source={PORTFOLIO_MASCOT}
        resizeMode="contain"
        style={styles.mascot}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <Text style={styles.label} maxFontSizeMultiplier={1.4}>
        Vốn đang đầu tư
      </Text>
      <Text
        style={[styles.value, valueSize]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        accessibilityLabel={`Vốn đang đầu tư ${invested}`}
      >
        {invested}
      </Text>
      <Text style={styles.sub} maxFontSizeMultiplier={1.4}>
        {`${summary.activeNoteCount} Note trên ${summary.positionCount} khoản vay`}
      </Text>

      {/* Ba dòng nhãn–số trong một khung mờ: số tiền đủ tám chữ số không vừa ba ô ngang trên máy hẹp. */}
      <View style={styles.stats}>
        {stats.map((s, i) => (
          <View
            key={s.label}
            style={[styles.stat, i > 0 && styles.statDivider]}
            accessible
            accessibilityLabel={`${s.label} ${s.value}`}
          >
            <Text style={styles.statLabel} maxFontSizeMultiplier={1.3}>{s.label}</Text>
            <Text style={styles.statValue} maxFontSizeMultiplier={1.3}>{s.value}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 14, overflow: 'hidden' },
  // Ảnh robot 480×510 đã cắt sát; đỉnh ăng-ten gần mép trên thẻ như thẻ ví trang chủ.
  mascot: { position: 'absolute', top: 2, right: 26, width: 108, height: 115 },
  label: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.onDarkMuted },
  value: {
    marginTop: 2,
    maxWidth: '64%',
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
    color: Colors.onDark,
    ...tabularNums,
  },
  sub: { marginTop: 2, maxWidth: '64%', fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.onDarkMuted },
  stats: { marginTop: 16, paddingHorizontal: 12, borderRadius: Radius.sm, backgroundColor: Colors.walletTile },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 38,
  },
  statDivider: { borderTopWidth: 1, borderTopColor: Colors.onDarkFaint },
  statLabel: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.onDarkMuted },
  statValue: { fontFamily: FontFamily.bold, fontSize: 14, lineHeight: 20, color: Colors.onDark, ...tabularNums },
});
