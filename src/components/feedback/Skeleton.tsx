import { useEffect } from 'react';
import { Animated, StyleSheet, View, useAnimatedValue, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/theme';

type Props = {
  /** Chiều cao khối giả. */
  height?: number;
  width?: number | `${number}%`;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Khối giả nhấp nháy dùng trong lúc tải.
 * Dùng skeleton thay vòng xoay để giữ nguyên chỗ của nội dung, tránh nhảy layout
 * khi dữ liệu về.
 */
export function Skeleton({ height = 20, width = '100%', radius = Radius.sm, style }: Props) {
  const opacity = useAnimatedValue(0.4);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityLabel="Đang tải"
      style={[styles.block, { height, width, borderRadius: radius, opacity }, style]}
    />
  );
}

/** Bộ khối giả mô phỏng một thẻ có tiêu đề và vài dòng dữ liệu. */
export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <View style={styles.card}>
      <Skeleton height={16} width="45%" />
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton height={16} width="40%" />
          <Skeleton height={16} width="28%" />
        </View>
      ))}
    </View>
  );
}

/** Màn hình đang tải — vài thẻ giả xếp dọc. */
export function LoadingScreen({ cards = 2 }: { cards?: number }) {
  return (
    <View style={styles.screen} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải dữ liệu">
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: Colors.grayBg },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.lg },
  screen: { gap: 0 },
});
