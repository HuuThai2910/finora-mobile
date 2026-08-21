import { StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';

/**
 * Lỗi ở cấp biểu mẫu — dành cho lỗi nghiệp vụ do backend trả về (email trùng,
 * sai mật khẩu, vượt hạn mức OTP), khác với lỗi của từng ô nhập.
 *
 * `accessibilityLiveRegion` để trình đọc màn hình đọc lên khi lỗi xuất hiện,
 * vì người dùng lúc đó đang ở nút gửi chứ không ở chỗ dòng lỗi.
 */
export default function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <Text style={styles.error} accessibilityLiveRegion="polite" accessibilityRole="alert">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  error: { ...Text_.micro, color: Colors.red, marginBottom: Spacing.lg },
});
