import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius } from '@/theme';
import type { BookConnection } from '../hook/useLiveOrderBook';

const LABEL: Record<BookConnection, string> = {
  live: 'Trực tiếp',
  polling: 'Tự cập nhật',
  connecting: 'Đang kết nối',
  paused: 'Tạm dừng',
};

/**
 * Cho biết sổ đang hiện có còn mới không. "Trực tiếp" khi nhận đẩy qua SSE; "Tự cập nhật" khi luồng
 * không mở được và màn đang hỏi lại vài giây một lần — vẫn đúng, chỉ chậm hơn. Có chữ đi kèm chấm
 * màu, không dựa vào màu.
 */
export default function LiveBadge({ connection }: { connection: BookConnection }) {
  const live = connection === 'live';
  return (
    <View style={styles.badge} accessibilityLabel={`Trạng thái cập nhật: ${LABEL[connection]}`}>
      <View style={[styles.dot, { backgroundColor: live ? Colors.bookLive : Colors.dotIdle }]} />
      <Text style={styles.text} maxFontSizeMultiplier={1.3}>{LABEL[connection]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, color: Colors.authInk },
});
