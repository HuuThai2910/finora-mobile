import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';

type Props =
  | { kind: 'error'; message: string; retrying: boolean; onRetry: () => void }
  | { kind: 'empty'; title: string; hint: string; action: string; onAction: () => void }
  | {
      kind: 'filtered';
      stageLabel: string;
      /** "hồ sơ" hoặc "hợp đồng" — màn hợp đồng dùng chung khối này. */
      noun: string;
      onShowAll: () => void;
    };

type Message = {
  icon: IconName;
  danger: boolean;
  title: string;
  hint: string;
  action: string;
  onAction: () => void;
  busy: boolean;
};

function messageFor(props: Exclude<Props, { kind: 'filtered' }>): Message {
  if (props.kind === 'error') {
    return {
      icon: 'alert',
      danger: true,
      title: props.message,
      hint: 'Kiểm tra kết nối mạng rồi thử lại.',
      action: 'Thử lại',
      onAction: props.onRetry,
      busy: props.retrying,
    };
  }
  return {
    icon: 'fileText',
    danger: false,
    title: props.title,
    hint: props.hint,
    action: props.action,
    onAction: props.onAction,
    busy: false,
  };
}

/**
 * Nội dung thay chỗ danh sách khi không có thẻ nào để vẽ: lỗi tải, chưa có hồ
 * sơ/hợp đồng, hoặc nhóm đang lọc vừa trống sau lần tải lại. Nằm trong thẻ trắng
 * để không chìm vào lớp sóng phía sau, và luôn chỉ ra việc làm tiếp theo. Màn
 * "Hợp đồng của tôi" dùng chung, nên câu chữ trạng thái trống do màn truyền vào.
 */
export default function ApplicationListStatus(props: Props) {
  if (props.kind === 'filtered') {
    return (
      <View style={[styles.card, styles.compact]} accessibilityLiveRegion="polite">
        <Text style={styles.hint}>{`Không còn ${props.noun} nào ở mục “${props.stageLabel}”.`}</Text>
        <Pressable
          onPress={props.onShowAll}
          accessibilityRole="button"
          hitSlop={{ top: 12, bottom: 12 }}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.link}>{`Xem tất cả ${props.noun}`}</Text>
        </Pressable>
      </View>
    );
  }

  const message = messageFor(props);
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={[styles.tile, message.danger ? styles.tileDanger : styles.tileInfo]}>
        <Icon
          name={message.icon}
          size={26}
          color={message.danger ? Colors.red : Colors.authPrimary}
        />
      </View>
      <Text style={styles.title}>{message.title}</Text>
      <Text style={[styles.hint, styles.centered]}>{message.hint}</Text>
      <Pressable
        onPress={message.onAction}
        disabled={message.busy}
        accessibilityRole="button"
        accessibilityLabel={message.action}
        accessibilityState={{ disabled: message.busy, busy: message.busy }}
        style={({ pressed }) => [styles.button, (pressed || message.busy) && styles.pressed]}
      >
        {message.busy ? (
          <ActivityIndicator size="small" color={Colors.onDark} />
        ) : (
          <Text style={styles.buttonText}>{message.action}</Text>
        )}
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
  compact: { alignItems: 'flex-start', gap: Spacing.xs, paddingVertical: Spacing.xl },
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
  hint: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 21, color: Colors.authMuted },
  centered: { textAlign: 'center' },
  link: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 21, color: Colors.authPrimary },
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
