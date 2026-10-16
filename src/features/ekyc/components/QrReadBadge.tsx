import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/theme';
import { Icon } from '@/components/ui';

type Props = { style?: StyleProp<ViewStyle> };

/**
 * Xác nhận nhỏ "Đã đọc mã QR" — cho người dùng biết mã trên thẻ đã được đọc, khỏi phải
 * cố đưa máy lại gần. Có cả biểu tượng và chữ, không chỉ dựa vào màu.
 */
export default function QrReadBadge({ style }: Props) {
  return (
    <View
      style={[styles.badge, style]}
      accessible
      accessibilityLabel="Đã đọc mã QR trên thẻ"
      accessibilityLiveRegion="polite"
    >
      <Icon name="check" size={14} color={Colors.tagGreenText} strokeWidth={3} />
      <Text style={styles.text}>Đã đọc mã QR</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.greenBg,
    borderWidth: 1,
    borderColor: Colors.tagGreenBorder,
  },
  text: { fontFamily: FontFamily.semibold, fontSize: FontSize.caption, color: Colors.tagGreenText },
});
