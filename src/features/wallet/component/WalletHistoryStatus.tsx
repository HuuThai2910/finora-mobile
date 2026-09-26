import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';

type Props =
  | { kind: 'error'; message: string; onRetry: () => void }
  | { kind: 'empty'; onTopUp: () => void };

type Message = {
  icon: IconName;
  danger: boolean;
  title: string;
  hint: string;
  action: string;
  onAction: () => void;
};

function messageFor(props: Props): Message {
  if (props.kind === 'error') {
    return {
      icon: 'alert',
      danger: true,
      title: props.message,
      hint: 'Kiểm tra kết nối mạng rồi thử lại.',
      action: 'Thử lại',
      onAction: props.onRetry,
    };
  }
  // Giữ lối "Nạp tiền" của màn cũ: ví trống thì việc tiếp theo là nạp tiền.
  return {
    icon: 'wallet',
    danger: false,
    title: 'Chưa có giao dịch',
    hint: 'Nạp tiền vào ví để bắt đầu.',
    action: 'Nạp tiền',
    onAction: props.onTopUp,
  };
}

/**
 * Nội dung thay chỗ danh sách giao dịch khi tải lỗi hoặc ví chưa có giao dịch.
 * Nằm trong thẻ trắng để không chìm vào nền, và luôn chỉ ra việc làm tiếp theo.
 */
export default function WalletHistoryStatus(props: Props) {
  const message = messageFor(props);
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={[styles.tile, message.danger ? styles.tileDanger : styles.tileInfo]}>
        <Icon name={message.icon} size={26} color={message.danger ? Colors.red : Colors.authPrimary} />
      </View>
      <Text style={styles.title}>{message.title}</Text>
      <Text style={styles.hint}>{message.hint}</Text>
      <Pressable
        onPress={message.onAction}
        accessibilityRole="button"
        accessibilityLabel={message.action}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>{message.action}</Text>
      </Pressable>
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
  tileInfo: { backgroundColor: Colors.tintBlue },
  tileDanger: { backgroundColor: Colors.redBg },
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
