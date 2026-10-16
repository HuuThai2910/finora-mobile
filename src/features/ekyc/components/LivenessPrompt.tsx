import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import type { IconName } from '@/constants/icons';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Icon } from '@/components/ui';
import type { LivenessStep } from '@/types/ekyc';

type Props = {
  /** Lời nhắc lớn — động tác hiện tại, số đếm ngược hoặc trạng thái. */
  text: string;
  icon?: IconName;
  /** Lịch nhắc của thử thách; chỉ vẽ thanh tiến độ khi đang quay. */
  steps: readonly LivenessStep[];
  stepIndex: number;
  showProgress: boolean;
};

/**
 * Lời nhắc động tác và thanh tiến độ chia đoạn theo đúng thời lượng từng bước (`holdMs`), để
 * người dùng thấy còn giữ tư thế bao lâu. Mỗi lần lời nhắc đổi thì đọc to cho trình đọc màn
 * hình — người khiếm thị vẫn làm theo được mà không phải nhìn màn.
 */
export default function LivenessPrompt({ text, icon, steps, stepIndex, showProgress }: Props) {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(text);
  }, [text]);

  return (
    <View style={styles.wrap}>
      <View style={styles.promptRow}>
        {icon ? <Icon name={icon} size={30} color={Colors.brand} strokeWidth={2.6} /> : null}
        <Text style={styles.prompt} accessibilityRole="header">
          {text}
        </Text>
      </View>

      {showProgress && steps.length > 0 ? (
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityLabel="Tiến độ quay"
          accessibilityValue={{ min: 0, max: steps.length, now: Math.max(0, stepIndex + 1) }}
        >
          {steps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.segment,
                { flex: step.holdMs },
                index < stepIndex && styles.done,
                index === stepIndex && styles.current,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.lg, marginBottom: Spacing.lg, minHeight: 72, justifyContent: 'center' },
  promptRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  prompt: { ...Text_.display, color: Colors.ink, textAlign: 'center', flexShrink: 1 },
  track: { flexDirection: 'row', gap: Spacing.xs },
  segment: { height: 8, borderRadius: Radius.pill, backgroundColor: Colors.progressTrack },
  done: { backgroundColor: Colors.brand },
  current: { backgroundColor: Colors.emerald },
});
