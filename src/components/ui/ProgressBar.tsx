import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Radius } from '@/theme';

type Props = {
  /** Phần trăm hoàn thành, 0–100. */
  percent: number;
  /** Nhãn cho trình đọc màn hình, ví dụ "Tiến độ gọi vốn". */
  label?: string;
  style?: StyleProp<ViewStyle>;
};

/** `.pb` của mockup — rãnh xám, thanh chạy gradient `brand → cyan`. */
export default function ProgressBar({ percent, label, style }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View
      style={[styles.track, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <LinearGradient
        colors={[Colors.brand, Colors.cyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${clamped}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 12,
    backgroundColor: Colors.progressTrack,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: Radius.pill },
});
