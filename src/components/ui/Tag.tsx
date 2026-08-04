import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/theme';

export type TagTone = 'green' | 'red' | 'amber' | 'blue' | 'violet' | 'gray';

const TONES: Record<TagTone, { bg: string; fg: string; border: string }> = {
  green: { bg: Colors.greenBg, fg: Colors.tagGreenText, border: Colors.tagGreenBorder },
  red: { bg: Colors.redBg, fg: Colors.tagRedText, border: Colors.tagRedBorder },
  amber: { bg: Colors.amberBg, fg: Colors.tagAmberText, border: Colors.tagAmberBorder },
  blue: { bg: Colors.blueBg, fg: Colors.tagBlueText, border: Colors.tagBlueBorder },
  violet: { bg: Colors.violetBg, fg: Colors.tagVioletText, border: Colors.tagVioletBorder },
  gray: { bg: Colors.grayBg, fg: Colors.tagGrayText, border: Colors.tagGrayBorder },
};

type Props = {
  children: string;
  tone?: TagTone;
  /** Cỡ nhỏ dùng cho tag nằm trong dòng dữ liệu dày đặc. */
  small?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** `.tag` của mockup — nền nhạt, chữ đậm cùng tông, viền cùng họ màu. */
export default function Tag({ children, tone = 'gray', small = false, style }: Props) {
  const t = TONES[tone];
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: t.bg, borderColor: t.border },
        small && styles.small,
        style,
      ]}
    >
      <Text style={[styles.text, { color: t.fg }, small && styles.textSmall]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  small: { paddingHorizontal: Spacing.md, paddingVertical: 2 },
  text: { fontFamily: FontFamily.semibold, fontSize: FontSize.body },
  textSmall: { fontSize: FontSize.caption },
});
