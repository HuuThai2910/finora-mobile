import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';

type Props = {
  title: string;
  icon?: IconName;
  /** Phần bên phải tiêu đề: mệnh giá Note, nút "Xem tất cả"… */
  right?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Thẻ trắng có tiêu đề nằm bên trong, như các khối "Sổ lệnh" và "Khớp gần đây" của mockup 02/10:
 * tiêu đề và phần phụ cùng một hàng, nội dung ngay dưới.
 */
export default function BookCard({ title, icon, right, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        {icon ? <Icon name={icon} size={22} color={Colors.authInk} /> : null}
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          {title}
        </Text>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: 2 },
  title: { flexShrink: 1, fontFamily: FontFamily.bold, fontSize: 18, lineHeight: 25, color: Colors.authInk },
  right: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
});
