import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_, tabularNums } from '@/theme';
import { ProgressBar, Tag } from '@/components/ui';
import { formatVND } from '@/utils/format';
import type { MarketLoan } from '@/types/invest';
import { GRADE_TONE } from '../constant';

/** Thẻ khoản vay trên sàn — tiêu đề, hạng, tiến độ gọi vốn. */
export default function LoanCard({ loan, onPress }: { loan: MarketLoan; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${loan.id}, ${formatVND(loan.amount)}, hạng ${loan.grade}, lãi ${loan.annualRate}% một năm, đã gọi ${loan.fundedPercent}% vốn`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.head}>
        <Text style={styles.title}>
          {loan.id} · {formatVND(loan.amount)}
        </Text>
        <Tag tone={GRADE_TONE[loan.grade]} small>
          {`${loan.grade} · ${loan.annualRate}%`}
        </Tag>
      </View>

      <ProgressBar
        percent={loan.fundedPercent}
        label={`Tiến độ gọi vốn ${loan.id}`}
        style={styles.bar}
      />

      <View style={styles.foot}>
        <Text style={styles.meta}>{loan.termMonths} tháng</Text>
        <Text style={styles.meta}>{loan.fundedPercent}% vốn</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  pressed: { opacity: 0.75 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  title: { ...Text_.bodyBold, color: Colors.ink, flexShrink: 1, ...tabularNums },
  bar: { marginTop: Spacing.lg, marginBottom: Spacing.md },
  foot: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { ...Text_.micro, color: Colors.ink3 },
});
