import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/theme';

type Props = {
  /** `error`: lỗi của câu vừa gửi; `muted`: thông tin (trợ lý tắt, chưa tải được gợi ý). */
  tone: 'error' | 'muted';
  message: string;
  action?: { label: string; onPress: () => void };
};

/** Dòng báo trạng thái trong màn chat, luôn có chữ và biểu tượng, không chỉ dựa vào màu. */
export default function ChatNotice({ tone, message, action }: Props) {
  const error = tone === 'error';
  return (
    <View
      style={[styles.box, error ? styles.error : styles.muted]}
      accessibilityRole={error ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      <Icon name={error ? 'alert' : 'info'} size={18} color={error ? Colors.tagRedText : Colors.authMuted} />
      <Text style={[styles.text, error && styles.errorText]}>{message}</Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  error: { backgroundColor: Colors.redBg },
  muted: { backgroundColor: Colors.walletHistoryNote },
  text: { flex: 1, fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  errorText: { color: Colors.tagRedText },
  action: { minHeight: 32, justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  actionText: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authPrimary },
});
