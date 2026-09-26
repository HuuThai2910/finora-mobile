import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';

type Props = {
  /** `info`: hướng dẫn bình thường. `warn`: cần người dùng để ý (quá hạn, lỗi tải PDF). */
  tone?: 'info' | 'warn';
  children: string;
  style?: StyleProp<ViewStyle>;
};

const TONES = {
  info: { bg: Colors.authNoteBg, fg: Colors.authNoteText, icon: 'info' },
  warn: { bg: Colors.amberBg, fg: Colors.tagAmberText, icon: 'alert' },
} as const;

/**
 * Dòng ghi chú nền nhạt có icon của bộ mockup mới, thay `InfoNote` kiểu cũ ở màn
 * hợp đồng. Icon khác nhau giữa hai tông để màu không phải tín hiệu duy nhất.
 */
export default function DetailNote({ tone = 'info', children, style }: Props) {
  const t = TONES[tone];

  return (
    <View style={[styles.note, { backgroundColor: t.bg }, style]} accessibilityLiveRegion="polite">
      <Icon name={t.icon} size={16} color={t.fg} />
      <Text style={[styles.text, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  text: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19 },
});
