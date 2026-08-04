import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';

type Props = {
  children: string;
  /** Tông nhạt dùng khi nhãn đứng trên nền thẻ có nội dung dày. */
  muted?: boolean;
  style?: StyleProp<TextStyle>;
};

/**
 * Nhãn chữ hoa nhỏ, giãn chữ `.05em` — mockup lặp lại khoảng 20 lần
 * ("GIAO DỊCH GẦN ĐÂY", "VÌ SAO ĐIỂM B? (SHAP)", "TẤT TOÁN SỚM HÔM NAY"…).
 * Đây là nhãn nhóm nội dung nên đánh dấu vai trò header cho trình đọc màn hình.
 */
export default function SectionLabel({ children, muted = false, style }: Props) {
  return (
    <Text
      accessibilityRole="header"
      style={[styles.base, muted && styles.muted, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { ...Text_.sectionLabel, color: Colors.ink, marginBottom: Spacing.lg },
  muted: { color: Colors.ink3 },
});
