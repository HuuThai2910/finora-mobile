import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';

type Props = {
  current: number;
  total: number;
  label: string;
};

/** Thanh tiến độ ngắn cho form nhiều màn, giúp người dùng biết còn bao nhiêu bước trước khi nộp. */
export default function FormStepProgress({ current, total, label }: Props) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: total, now: current, text: `Bước ${current} trên ${total}` }}
      style={styles.wrap}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>{current}/{total}</Text>
      </View>
      <View style={styles.track}>
        {Array.from({ length: total }, (_, index) => (
          <View key={index} style={[styles.segment, index < current && styles.segmentActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md, marginBottom: Spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...Text_.microBold, color: Colors.ink2 },
  count: { ...Text_.microBold, color: Colors.brand },
  track: { flexDirection: 'row', gap: Spacing.sm },
  segment: { flex: 1, height: 4, borderRadius: Radius.pill, backgroundColor: Colors.line },
  segmentActive: { backgroundColor: Colors.brand },
});
