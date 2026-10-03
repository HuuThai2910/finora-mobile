import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, Spacing } from '@/theme';

type Props = {
  options: readonly string[];
  value: readonly string[];
  onChange: (grades: string[]) => void;
};

/**
 * Chọn nhiều hạng tín dụng. Chip đang chọn nền xanh nhạt, viền và chữ xanh như chip chọn nhanh của
 * luồng vay; là checkbox chứ không phải radio vì Auto-Invest thường nhận nhiều hạng một lúc.
 */
export default function GradePicker({ options, value, onChange }: Props) {
  const toggle = (grade: string) => {
    onChange(value.includes(grade) ? value.filter(g => g !== grade) : [...value, grade]);
  };

  return (
    <View accessibilityLabel="Chọn hạng tín dụng" style={styles.row}>
      {options.map(grade => {
        const active = value.includes(grade);
        return (
          <Pressable
            key={grade}
            onPress={() => toggle(grade)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            accessibilityLabel={`Hạng ${grade}`}
            style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
          >
            <Text style={[styles.text, active && styles.textActive]} maxFontSizeMultiplier={1.3}>
              {grade}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  chip: {
    minHeight: MIN_TOUCH,
    minWidth: MIN_TOUCH + 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    // Chip chưa chọn vẫn có viền cùng màu nền, để lúc chọn chữ không xê dịch.
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.card,
  },
  chipActive: { borderColor: Colors.authPrimary, backgroundColor: Colors.tintBlue },
  pressed: { opacity: 0.7 },
  text: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authMuted },
  textActive: { fontFamily: FontFamily.bold, color: Colors.authPrimary },
});
