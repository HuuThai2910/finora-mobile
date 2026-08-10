import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useAnimatedValue } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Text_ } from '@/theme';

export type StepState = 'done' | 'doing' | 'todo';

export type Step = {
  /** Khoá riêng khi tiêu đề có thể lặp lại (một trạng thái chạy lại nhiều lần). */
  id?: string;
  title: string;
  /** Chú thích dưới tiêu đề bước, ví dụ "10/07 · 14:20". */
  detail?: string;
  state: StepState;
};

const DOT = 39; // mockup 26px trong khung điện thoại × 1.5

/**
 * `.steps` / `.step` / `.dot` của mockup — dòng thời gian dọc có đường nối.
 * Bước đang chạy nhấp nháy nhẹ như `animation:pulse` của mockup; trạng thái
 * vẫn đọc được qua ký hiệu và nhãn nên không phụ thuộc vào chuyển động.
 */
export default function StepList({ steps }: { steps: readonly Step[] }) {
  return (
    <View>
      {steps.map((s, i) => (
        <View key={s.id ?? s.title} style={styles.step}>
          <View style={styles.dotColumn}>
            <Dot step={s} index={i} />
            {i < steps.length - 1 ? <View style={styles.connector} /> : null}
          </View>

          <View style={styles.body}>
            <Text style={styles.title}>{s.title}</Text>
            {s.detail ? <Text style={styles.detail}>{s.detail}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function Dot({ step, index }: { step: Step; index: number }) {
  const opacity = useAnimatedValue(1);
  const loop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (step.state !== 'doing') return;
    loop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.current.start();
    return () => loop.current?.stop();
  }, [step.state, opacity]);

  const label =
    step.state === 'done' ? '✓' : String(index + 1);
  const stateText =
    step.state === 'done' ? 'đã xong' : step.state === 'doing' ? 'đang chạy' : 'chưa tới';

  return (
    <Animated.View
      accessibilityLabel={`Bước ${index + 1}, ${stateText}`}
      style={[
        styles.dot,
        step.state === 'done' && styles.dotDone,
        step.state === 'doing' && styles.dotDoing,
        step.state === 'doing' && { opacity },
      ]}
    >
      <Text
        style={[
          styles.dotText,
          step.state === 'done' && styles.dotTextDone,
          step.state === 'doing' && styles.dotTextDoing,
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: Spacing.xl },
  dotColumn: { alignItems: 'center' },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 3,
    borderColor: Colors.line,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: Colors.emerald, borderColor: Colors.emerald },
  dotDoing: { borderColor: Colors.brand },
  dotText: { fontFamily: FontFamily.bold, fontSize: FontSize.body, color: Colors.ink3 },
  dotTextDone: { color: Colors.onDark },
  dotTextDoing: { color: Colors.brand },
  connector: { flex: 1, width: 3, backgroundColor: Colors.line },
  body: { flex: 1, paddingBottom: Spacing.xxl, gap: 2 },
  title: { ...Text_.bodyBold, color: Colors.ink },
  detail: { ...Text_.micro, color: Colors.ink3 },
});
