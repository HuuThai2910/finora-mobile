import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';

/**
 * Dòng báo lỗi khi đánh dấu đã đọc thất bại. Danh sách vẫn hiện bên dưới (tin lỗi
 * đã trở lại chưa đọc), nên chỉ cần một dòng ngắn chứ không thay cả danh sách.
 */
export default function NotificationActionError({ message }: { message: string }) {
  return (
    <View style={styles.box} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icon name="alert" size={18} color={Colors.red} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.redBg,
  },
  text: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 13.5,
    lineHeight: 19,
    color: Colors.tagRedText,
  },
});
