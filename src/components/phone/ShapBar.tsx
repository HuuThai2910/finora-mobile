import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, Text_, tabularNums } from '@/theme';

export type ShapFactor = {
  /** Tên yếu tố, ví dụ "Trả đúng hạn 4/4 kỳ". */
  name: string;
  /** Điểm cộng/trừ. Dấu quyết định màu và chiều. */
  impact: number;
};

const NEG = '#f2707d';

/**
 * `.shap` của mockup — giải thích điểm tín dụng theo từng yếu tố.
 * Chiều tác động thể hiện bằng cả dấu +/− lẫn màu, không chỉ bằng màu.
 */
export default function ShapBar({ factors }: { factors: readonly ShapFactor[] }) {
  const max = Math.max(...factors.map(f => Math.abs(f.impact)), 1);

  return (
    <View style={styles.wrap}>
      {factors.map(f => {
        const positive = f.impact >= 0;
        const width = `${Math.round((Math.abs(f.impact) / max) * 100)}%` as const;

        return (
          <View
            key={f.name}
            style={styles.row}
            accessibilityLabel={`${f.name}: ${positive ? 'cộng' : 'trừ'} ${Math.abs(f.impact)} điểm`}
          >
            <Text style={styles.name} numberOfLines={2}>
              {f.name}
            </Text>

            <View style={styles.track}>
              <View
                style={[styles.bar, { width, backgroundColor: positive ? Colors.emerald : NEG }]}
              />
            </View>

            <Text style={[styles.value, { color: positive ? Colors.green : Colors.red }]}>
              {positive ? '+' : '−'}
              {Math.abs(f.impact)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  name: { ...Text_.micro, color: Colors.ink, width: 150 },
  track: { flex: 1 },
  bar: { height: 15, borderRadius: Radius.md },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.micro,
    width: 45,
    textAlign: 'right',
    ...tabularNums,
  },
});
