import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, lh } from '@/theme';

type Props = {
  title: string;
  children: React.ReactNode;
  /** Màn ghi lại vị trí nhóm để cuộn tới lỗi đầu tiên khi bấm nộp. */
  onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * Một nhóm của form bước 3/3: nhãn chữ hoa ("MỤC ĐÍCH VAY"…) và các dòng nhập
 * cách đều bên dưới. Nhãn mang vai trò header để trình đọc màn hình nhảy nhóm.
 */
export default function ApplyFormSection({ title, children, onLayout }: Props) {
  return (
    <View style={styles.section} onLayout={onLayout}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.xxxl },
  title: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xxs,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro, 1.45),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.authMuted,
  },
  body: { gap: Spacing.lg },
});
