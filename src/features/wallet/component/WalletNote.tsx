import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/theme';

type Props = {
  text: string;
  /** `danger`: lỗi của một thao tác (tạo lệnh, kiểm tra trạng thái), nền đỏ nhạt có biểu tượng cảnh báo. */
  tone?: 'info' | 'danger';
};

/**
 * Ô ghi chú của các màn ví (mockup "Lịch sử ví" 26/09/2026): ghi chú đối soát cuối danh sách, lưu ý
 * khi nạp tiền, và báo lỗi thao tác cùng một dáng để màn không có hai kiểu hộp thông báo.
 */
export default function WalletNote({ text, tone = 'info' }: Props) {
  // Không để gạch ngang "—" rơi xuống đầu dòng khi câu xuống dòng trên máy hẹp.
  const body = text.replace(/ — /g, ' — ');

  if (tone === 'danger') {
    return (
      <View style={[styles.note, styles.danger]} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <Icon name="alert" size={22} color={Colors.red} />
        <Text style={[styles.text, styles.dangerText]}>{body}</Text>
      </View>
    );
  }

  return (
    <View style={styles.note}>
      {/* Chữ "i" trắng trong vòng tròn đặc như mockup; dựng bằng hai khối vì icon
          Lucide "info" chỉ có nét viền. Thuần trang trí nên ẩn với trình đọc màn hình. */}
      <View style={styles.icon} aria-hidden>
        <View style={styles.dot} />
        <View style={styles.bar} />
      </View>
      <Text style={styles.text}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.walletHistoryNote,
  },
  danger: { backgroundColor: Colors.redBg },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: Colors.authPrimary,
  },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.onDark },
  bar: { width: 3, height: 9, borderRadius: 1.5, backgroundColor: Colors.onDark },
  text: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authMuted,
  },
  dangerText: { fontFamily: FontFamily.medium, color: Colors.tagRedText },
});
