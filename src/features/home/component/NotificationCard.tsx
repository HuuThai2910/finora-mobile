import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, tabularNums } from '@/theme';
import type { NotificationTone } from '../constant';
import type { NotificationView } from '../mappers/notificationFeed';

type Props = {
  item: NotificationView;
  onMarkRead: (id: string) => void;
};

/** Cỡ hình đầu thẻ: ngang chiều cao chữ hoa của tên nhóm, đứng như một chữ cái chứ không như ô biểu tượng. */
export const NOTIFICATION_GLYPH = 16;

/**
 * Màu hình và tên nhóm. Hình luôn có màu theo nghĩa; tên nhóm chỉ đỏ theo khi tin là
 * cảnh báo (lịch trả nợ đổi, quá hạn, đăng nhập lạ), còn lại xám như giờ.
 */
const TONE: Record<NotificationTone, { glyph: string; label: string }> = {
  money: { glyph: Colors.green, label: Colors.authMuted },
  info: { glyph: Colors.authPrimary, label: Colors.authMuted },
  // Cùng màu chấm đỏ của tin chưa đọc và của chuông trang chủ (đạt 4,56:1 trên nền trắng).
  danger: { glyph: Colors.red, label: Colors.red },
};

/**
 * Một thông báo theo dáng thông báo đẩy (Hải gửi mẫu 10/10/2026): hàng đầu là hình của
 * nhóm + tên nhóm + giờ ở góc phải; bên dưới là một câu "Tiêu đề • nội dung", số tiền
 * in đậm ngay trong câu.
 *
 * Hình đứng trần cạnh chữ, không nằm trong ô. Đã thử ô đặc màu (quá đậm), ô màu nhạt
 * (nhìn như bộ icon lắp sẵn), logo FINORA ở mọi thẻ (không nói thêm điều gì) và bỏ hẳn
 * hình (thiếu). Mỗi hình vẽ đúng việc đã xảy ra, xem `NOTIFICATION_ICON`.
 *
 * Tin chưa đọc có chấm đỏ đè lên góc trên bên phải của thẻ (cùng màu chấm trên
 * chuông trang chủ) và tiêu đề đậm hơn; chạm vào để đánh dấu đã đọc. Tin đã đọc
 * không còn thao tác nào nên chỉ là khối đọc được, không giả nút.
 */
export default function NotificationCard({ item, onMarkRead }: Props) {
  const tone = TONE[item.tone];

  const content = (
    <>
      <View style={styles.header}>
        <Icon name={item.icon} size={NOTIFICATION_GLYPH} color={tone.glyph} strokeWidth={2} />
        <Text
          style={[styles.label, { color: tone.label }]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {item.label}
        </Text>
        {item.time ? (
          <Text style={styles.time} numberOfLines={1} maxFontSizeMultiplier={1.3}>
            {item.time}
          </Text>
        ) : null}
      </View>

      <Text style={styles.body} numberOfLines={3} maxFontSizeMultiplier={1.4}>
        <Text style={item.unread ? styles.titleUnread : styles.titleRead}>{item.title}</Text>
        {' • '}
        {item.body.before}
        {item.body.amount ? (
          <Text style={[styles.amount, item.amountIn && styles.amountIn]}>{item.body.amount}</Text>
        ) : null}
        {item.body.after}
      </Text>

      {/* Trang trí thuần: trạng thái "Chưa đọc" đã nằm trong nhãn đọc của cả thẻ. */}
      {item.unread ? <View style={styles.dot} /> : null}
    </>
  );

  if (!item.unread) {
    return (
      <View style={styles.card} accessible accessibilityLabel={item.accessibilityLabel}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => onMarkRead(item.id)}
      accessibilityRole="button"
      accessibilityLabel={item.accessibilityLabel}
      accessibilityHint="Đánh dấu đã đọc"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const DOT = 14;

const styles = StyleSheet.create({
  card: {
    gap: 7,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 13,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.72 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // Chữ thường như mọi nhãn khác của app; màu đặt theo nhóm ở `TONE`.
  label: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    flexShrink: 0,
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.authMuted,
    ...tabularNums,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: Colors.authInk,
  },
  titleUnread: { fontFamily: FontFamily.bold },
  titleRead: { fontFamily: FontFamily.semibold },
  amount: { fontFamily: FontFamily.bold, ...tabularNums },
  amountIn: { color: Colors.walletHistoryIn },
  // Đè lên góc thẻ như chấm trên chuông; viền trắng tách chấm khỏi nền xanh nhạt của màn.
  dot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
    borderColor: Colors.card,
    backgroundColor: Colors.red,
  },
});
