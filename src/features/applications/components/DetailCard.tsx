import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';

type Props = {
  /** Tiêu đề thẻ; bỏ trống khi thẻ tự dựng phần đầu (thẻ tóm tắt). */
  title?: string;
  /** Icon nét xanh đứng trước tiêu đề. */
  icon?: IconName;
  /** Ô icon tô màu thay cho icon nét, dùng cho thẻ cần gây chú ý hơn (kết quả điều khoản). */
  badge?: { icon: IconName; color: string };
  /** Phụ kiện bên phải tiêu đề, như nhãn "Đã cập nhật". */
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Thẻ trắng một mục của màn chi tiết hồ sơ (mockup 26/09/2026): icon + tiêu đề
 * đậm, rồi nội dung. Mọi mục dùng chung thẻ này để lề, bóng và nhịp chữ đồng
 * đều; thẻ nào cũng nằm thẳng trên nền sóng nên không dùng viền.
 */
export default function DetailCard({ title, icon, badge, right, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {title ? (
        <View style={styles.header}>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: badge.color }]}>
              <Icon name={badge.icon} size={14} color={Colors.onDark} strokeWidth={2.4} />
            </View>
          ) : icon ? (
            <Icon name={icon} size={20} color={Colors.authPrimary} />
          ) : null}
          <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
            {title}
          </Text>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.lg,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 24 },
  badge: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.authInk,
  },
});
