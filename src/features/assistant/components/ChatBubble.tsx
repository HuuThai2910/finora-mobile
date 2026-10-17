import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';

type Props = {
  role: 'user' | 'assistant';
  text?: string;
  /** Câu hỏi chưa gửi được: viền đỏ và nhãn chữ, không chỉ đổi màu. */
  failed?: boolean;
  /** Phần thêm của câu trả lời: thẻ số liệu, nút, căn cứ. */
  children?: React.ReactNode;
};

const AVATAR = 30;

/**
 * Bong bóng chat. Câu của người dùng nằm phải, nền xanh chủ đạo; câu của trợ lý nằm trái, thẻ trắng
 * kèm ô robot để luôn biết đâu là lời của AI. Chữ cho phép chọn để người dùng chép mã hồ sơ, số tiền.
 */
export default function ChatBubble({ role, text, failed = false, children }: Props) {
  if (role === 'user') {
    return (
      <View style={styles.userRow}>
        <View style={[styles.userBubble, failed && styles.userFailed]}>
          <Text style={styles.userText} selectable>
            {text}
          </Text>
        </View>
        {failed ? (
          <Text style={styles.failedText} accessibilityLiveRegion="polite">
            Chưa gửi được
          </Text>
        ) : null}
      </View>
    );
  }
  return (
    <View style={styles.assistantRow}>
      <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Icon name="robot" size={18} color={Colors.authPrimary} />
      </View>
      <View style={styles.assistantBubble}>
        {text ? (
          <Text style={styles.assistantText} selectable>
            {text}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: { alignItems: 'flex-end', gap: 4 },
  userBubble: {
    maxWidth: '86%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderBottomRightRadius: 6,
    backgroundColor: Colors.authPrimary,
    borderWidth: 1.5,
    borderColor: Colors.authPrimary,
  },
  userFailed: { borderColor: Colors.bookAsk },
  userText: { fontFamily: FontFamily.regular, fontSize: 15, lineHeight: 22, color: Colors.onDark },
  failedText: { fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 16, color: Colors.tagRedText },
  assistantRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  assistantBubble: {
    flex: 1,
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    borderTopLeftRadius: 6,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  assistantText: { fontFamily: FontFamily.regular, fontSize: 15, lineHeight: 22, color: Colors.authInk },
});
