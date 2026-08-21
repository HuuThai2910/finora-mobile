import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';

/** Chiều cao vệt sáng chạy trước tia quét. */
const BEAM_HEIGHT = 72;

type Props = {
  /** Chiều cao vùng quét, để tia chạy đúng từ mép trên xuống mép dưới. */
  height: number;
  /** Thời gian đi hết một chiều (ms). */
  duration?: number;
};

/**
 * Tia quét chạy lên xuống trong khung ngắm.
 *
 * Thuần trang trí: báo cho người dùng biết camera đang hoạt động và cần giữ
 * yên thẻ. Không phản ánh tiến trình xử lý nào — việc đọc ảnh chỉ xảy ra sau
 * khi bấm chụp — nên component bị ẩn khỏi trình đọc màn hình và không nhận
 * chạm, để không che nút bên dưới.
 *
 * Chạy bằng `useNativeDriver` để animation không bị khựng khi luồng JS bận
 * mã hoá base64. Khi người dùng bật "giảm chuyển động" trong hệ điều hành thì
 * đổi sang một vạch tĩnh thay vì tắt hẳn, để khung ngắm vẫn có mốc căn giữa.
 */
export default function ScanLine({ height, duration = 2000 }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled()
      .then(enabled => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        // Không đọc được thiết lập thì cứ chạy animation như bình thường
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled =>
      setReduceMotion(enabled),
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const timing = (toValue: number) =>
      Animated.timing(progress, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      });

    const loop = Animated.loop(Animated.sequence([timing(1), timing(0)]));
    loop.start();

    // Dừng vòng lặp khi rời màn hình, nếu không animation chạy nền vô hạn
    return () => loop.stop();
  }, [duration, progress, reduceMotion]);

  if (reduceMotion) {
    return (
      <View
        style={[styles.staticLine, { top: Math.max(0, height / 2 - 1) }]}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    );
  }

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, height - BEAM_HEIGHT)],
  });

  return (
    <Animated.View
      style={[styles.beam, { transform: [{ translateY }] }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient
        colors={['rgba(29,78,216,0)', 'rgba(29,78,216,0.30)']}
        style={styles.glow}
      />
      <View style={styles.line} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  beam: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: BEAM_HEIGHT,
    justifyContent: 'flex-end',
  },
  glow: { flex: 1 },
  line: { height: 2, backgroundColor: Colors.brand },
  staticLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.brand,
  },
});
