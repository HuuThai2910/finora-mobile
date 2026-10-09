import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';

type Props =
  | { kind: 'error'; message: string; onRetry: () => void }
  | { kind: 'empty' };

type Message = {
  icon: IconName;
  tone: 'info' | 'danger';
  title: string;
  hint: string;
  action?: { label: string; onPress: () => void };
};

function messageFor(props: Props): Message {
  if (props.kind === 'error') {
    return {
      icon: 'alert',
      tone: 'danger',
      title: props.message,
      hint: 'Kiểm tra kết nối mạng rồi thử lại.',
      action: { label: 'Thử lại', onPress: props.onRetry },
    };
  }
  // Chưa có tin thì không có việc gì để làm tiếp: chỉ nói rõ tin nào sẽ hiện ở đây.
  return {
    icon: 'bell',
    tone: 'info',
    title: 'Chưa có thông báo',
    hint: 'Tin về dòng tiền, khoản vay và bảo mật tài khoản sẽ hiện ở đây.',
  };
}

const TILE = {
  info: { bg: Colors.tintBlue, fg: Colors.authPrimary },
  danger: { bg: Colors.redBg, fg: Colors.red },
} as const;

/**
 * Nội dung thay chỗ danh sách khi tải lỗi hoặc chưa có tin nào. Nằm trong thẻ
 * trắng như các màn danh sách khác để không chìm vào nền.
 */
export default function NotificationListStatus(props: Props) {
  const message = messageFor(props);
  const tile = TILE[message.tone];
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={[styles.tile, { backgroundColor: tile.bg }]}>
        <Icon name={message.icon} size={26} color={tile.fg} />
      </View>
      <Text style={styles.title}>{message.title}</Text>
      <Text style={styles.hint}>{message.hint}</Text>
      {message.action ? (
        <Pressable
          onPress={message.action.onPress}
          accessibilityRole="button"
          accessibilityLabel={message.action.label}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{message.action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxxl,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.authInk,
    textAlign: 'center',
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.authMuted,
    textAlign: 'center',
  },
  button: {
    minHeight: MIN_TOUCH,
    minWidth: 180,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 20, color: Colors.onDark },
  pressed: { opacity: 0.7 },
});
