import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import { PIN_LENGTH } from '../constants';

type Props = {
  filled: number;
  /** Đổi giá trị là rung hàng chấm một lần (nhập sai, mã yếu, không khớp). */
  shakeCount: number;
};

const DOT_SIZE = 16;
const SHAKE_OFFSET = 10;
const SHAKE_STEP_MS = 50;

/**
 * Sáu chấm thay cho chữ số: chỉ cho biết đã nhập bao nhiêu số, không bao giờ lộ số nào.
 * Trình đọc màn hình cũng chỉ nghe được số lượng.
 */
export default function PinDots({ filled, shakeCount }: Props) {
  const offset = useRef(new Animated.Value(0)).current;
  const firstRender = useRef(true);

  // Rung ngang ngắn như MoMo khi bị từ chối; bỏ qua lần render đầu vì bộ đếm bắt đầu từ 0.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const step = (toValue: number) =>
      Animated.timing(offset, { toValue, duration: SHAKE_STEP_MS, useNativeDriver: true });
    const animation = Animated.sequence([
      step(SHAKE_OFFSET),
      step(-SHAKE_OFFSET),
      step(SHAKE_OFFSET / 2),
      step(-SHAKE_OFFSET / 2),
      step(0),
    ]);
    animation.start();
    return () => animation.stop();
  }, [offset, shakeCount]);

  return (
    <Animated.View
      style={[styles.row, { transform: [{ translateX: offset }] }]}
      accessible
      accessibilityLabel={`Đã nhập ${filled} trên ${PIN_LENGTH} số`}
      accessibilityLiveRegion="polite"
    >
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <View key={i} style={[styles.dot, i < filled && styles.dotFilled]} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl, paddingVertical: Spacing.lg },
  // Viền giữ nguyên độ dày khi chấm được tô, để hàng chấm không xê dịch.
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 1.5,
    borderColor: Colors.authControl,
    backgroundColor: Colors.card,
  },
  dotFilled: { borderColor: Colors.authPrimary, backgroundColor: Colors.authPrimary },
});
