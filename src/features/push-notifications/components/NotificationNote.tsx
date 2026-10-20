import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Radius, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  /** `info`: giải thích bình thường. `warn`: cần để ý (đang chạy dữ liệu giả, lưu công tắc lỗi). */
  tone?: 'info' | 'warn';
  children: string;
};

const TONES = {
  info: { bg: Colors.authNoteBg, fg: Colors.authMuted, icon: Colors.authPrimary, name: 'info' },
  warn: { bg: Colors.amberBg, fg: Colors.tagAmberText, icon: Colors.tagAmberText, name: 'alert' },
} as const;

const TEXT_SIZE = FontSize.micro;

/**
 * Hộp ghi chú nền nhạt có icon, cùng kiểu hộp ghi chú cuối màn "Thông tin tài khoản" (`AccountInfoNote`). Hai tông
 * khác nhau cả icon lẫn màu để màu không phải tín hiệu duy nhất.
 */
export default function NotificationNote({ tone = 'info', children }: Props) {
  const t = TONES[tone];
  return (
    <View style={[styles.box, { backgroundColor: t.bg }]} accessibilityLiveRegion={tone === 'warn' ? 'polite' : 'none'}>
      <Icon name={t.name} size={22} color={t.icon} strokeWidth={1.9} />
      <Text style={[styles.text, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
  },
  text: {
    flex: 1,
    minWidth: 0,
    fontFamily: FontFamily.regular,
    fontSize: TEXT_SIZE,
    lineHeight: lh(TEXT_SIZE, LineHeight.heading),
  },
});
