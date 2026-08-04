import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, lh } from '@/theme';

export type NoteTone = 'info' | 'success' | 'warn' | 'chain';

const TONES: Record<NoteTone, { bg: string; fg: string; border?: string }> = {
  info: { bg: Colors.brand50, fg: '#1e3a8a' },
  success: { bg: Colors.greenBg, fg: Colors.tagGreenText },
  warn: { bg: Colors.warnBg, fg: Colors.warnText, border: Colors.warnBorder },
  /** Khối ghi chú blockchain — mockup dùng nền cyan nhạt và chữ đẳng khoảng. */
  chain: { bg: Colors.violetBg, fg: Colors.tagVioletText },
};

type Props = {
  children: React.ReactNode;
  tone?: NoteTone;
  /** Dùng chữ đẳng khoảng cho hash, mã giao dịch. */
  mono?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Các hộp chú thích nền nhạt rải khắp mockup (`background:var(--brand-50)`,
 * `var(--green-bg)`, `#fffbeb`, `var(--violet-bg)`).
 */
export default function InfoNote({ children, tone = 'info', mono = false, style }: Props) {
  const t = TONES[tone];

  return (
    <View
      style={[
        styles.box,
        { backgroundColor: t.bg, borderColor: t.border ?? 'transparent', borderWidth: t.border ? 1 : 0 },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, mono && styles.mono, { color: t.fg }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  text: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro),
  },
  mono: { fontFamily: 'monospace' },
});
