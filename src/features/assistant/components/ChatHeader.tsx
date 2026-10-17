import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';

type Props = { topInset: number; onClose: () => void };

/**
 * Đầu màn chat: tên trợ lý và một dòng nói rõ phạm vi (AI, chỉ đọc) để người dùng không tưởng
 * trợ lý làm thay được việc gì. Nút X đóng modal, quay về đúng màn đã mở trợ lý.
 */
export default function ChatHeader({ topInset, onClose }: Props) {
  return (
    <View style={[styles.wrap, { paddingTop: topInset + Spacing.sm }]}>
      <View style={styles.avatar}>
        <Icon name="robot" size={22} color={Colors.authPrimary} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.5}>
          Trợ lý FINORA
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={1.4}>
          Trợ lý AI chỉ đọc, không thực hiện giao dịch
        </Text>
      </View>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Đóng trợ lý"
        style={({ pressed }) => [styles.close, pressed && styles.pressed]}
      >
        <Icon name="x" size={24} color={Colors.authInk} />
      </Pressable>
    </View>
  );
}

const AVATAR = 40;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rowDivider,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  title: { fontFamily: FontFamily.bold, fontSize: 18, lineHeight: 26, color: Colors.authInk },
  subtitle: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  close: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginRight: -Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
});
