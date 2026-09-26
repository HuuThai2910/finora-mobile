import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import { Icon } from '@/components/ui';

/** Hộp thông tin nền xanh nhạt có icon "i" của nhóm màn tài khoản (mockup quên mật khẩu). */
export default function AuthNote({ children }: { children: string }) {
  return (
    <View style={styles.box}>
      <Icon name="info" size={22} color={Colors.authPrimary} strokeWidth={1.8} />
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    backgroundColor: Colors.authNoteBg,
    marginBottom: Spacing.xl,
  },
  text: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.authNoteText,
  },
});
