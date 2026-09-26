import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, LineHeight, Radius, SoftShadow, Spacing, lh } from '@/theme';
import AccountInfoTile from './AccountInfoTile';

type Props = {
  /** Khung giả lúc tải tự vẽ dòng đầu thẻ nên bỏ trống cả hai. */
  icon?: IconName;
  title?: string;
  children: React.ReactNode;
};

const TITLE_SIZE = 16;
/** Khoảng từ ô icon đầu thẻ tới vạch ngăn đầu tiên; khung giả lúc tải dùng lại. */
export const INFO_HEADER_GAP = 10;

/**
 * Thẻ trắng gom một nhóm thông tin: dòng đầu (ô icon + tiêu đề chữ hoa) rồi các
 * dòng `AccountInfoRow`; mỗi dòng tự kẻ vạch ngăn phía trên nên vạch dưới dòng
 * đầu thẻ cũng là vạch của dòng thứ nhất.
 */
export default function AccountInfoCard({ icon, title, children }: Props) {
  return (
    <View style={styles.card}>
      {icon && title ? (
        <View style={styles.header}>
          <AccountInfoTile icon={icon} />
          {/* Viết hoa bằng style chứ không bằng chuỗi: trình đọc màn hình đọc
              "Tài khoản" như một từ thay vì đánh vần từng chữ cái. */}
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    ...SoftShadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingBottom: INFO_HEADER_GAP,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: TITLE_SIZE,
    // Chữ hoa có dấu (À, Ả, Â) cần dòng cao hơn để Android không cắt ngọn dấu.
    lineHeight: lh(TITLE_SIZE, LineHeight.heading),
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: Colors.authInk,
  },
});
