import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Skeleton } from '@/components/feedback';
import { Icon } from '@/components/ui';
import { NOTIFICATIONS_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';
import { NOTIFICATIONS_ART, NOTIFICATIONS_PADDING } from '../constant';

type Props = {
  /** Bề rộng cột nội dung (đã giới hạn trên web); ảnh nền phóng theo bề rộng này. */
  width: number;
  topInset: number;
  loading: boolean;
  /** `null` khi chưa có gì để đếm (đang tải, lỗi). */
  counts: { all: number; unread: number } | null;
  markingAll: boolean;
  onMarkAllRead: () => void;
};

const TOP_GAP = Spacing.xs;
/** Kéo nút quay lại sát lề để mũi tên gần thẳng hàng mép thẻ; vùng chạm vẫn đủ 44pt. */
const BACK_PULL = 12;
/** Chừa giữa chữ và mép trái cụm hình bên phải. */
const ART_GAP = Spacing.md;
/** Khoảng giữa chân robot và tiêu đề nhóm ngày đầu tiên. */
const GROUND_GAP = Spacing.lg;
/** Hai dấu tích cỡ gần nút quay lại (26pt) để hai nút hai góc cân nhau. */
const MARK_ALL_ICON = 24;

/**
 * Đầu màn "Thông báo": nút quay lại cùng tiêu đề ở góc trái, nút hai dấu tích "đánh
 * dấu tất cả đã đọc" ở góc phải (chỉ khi còn tin chưa đọc), dòng đếm tin chưa đọc
 * dưới tiêu đề. Robot cầm hộp quà thuộc ảnh nền nằm nửa phải; khối này cao tới chân
 * robot để danh sách bắt đầu ngay dưới hình.
 */
export default function NotificationsHeader({
  width,
  topInset,
  loading,
  counts,
  markingAll,
  onMarkAllRead,
}: Props) {
  const nav = useNavigation();
  const canGoBack = nav.canGoBack();

  const scale = width / NOTIFICATIONS_WAVES.width;
  const top = topInset + TOP_GAP;
  const textIndent = canGoBack ? MIN_TOUCH - BACK_PULL : 0;
  // Dòng đếm nằm cột trái, ngang thân robot trên máy có tai thỏ: chữ phóng to
  // xuống dòng trước mép hình chứ không đè lên.
  const subtitleMaxWidth = NOTIFICATIONS_ART.left * scale - NOTIFICATIONS_PADDING - textIndent - ART_GAP;
  // Ảnh nằm sát mép trên màn (không lùi theo vùng an toàn), nên đo từ mép màn;
  // `minHeight` đã tính cả phần đệm trên. Máy có tai thỏ rất cao thì hàng tiêu đề
  // có thể xuống quá chân robot — khi đó khối cao theo hàng tiêu đề.
  const minHeight = Math.max(NOTIFICATIONS_ART.bottom * scale + GROUND_GAP, top + MIN_TOUCH);

  const unread = counts?.unread ?? 0;
  const subtitle = !counts || counts.all === 0 ? null : unread > 0 ? `${unread} tin chưa đọc` : 'Bạn đã đọc hết';

  return (
    <View style={{ paddingTop: top, minHeight }}>
      <View style={styles.row}>
        {canGoBack ? (
          <Pressable
            onPress={() => nav.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Icon name="chevronLeft" size={26} color={Colors.authInk} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.6}>
          Thông báo
        </Text>
        {unread > 0 ? (
          <Pressable
            onPress={onMarkAllRead}
            disabled={markingAll}
            accessibilityRole="button"
            accessibilityLabel="Đánh dấu tất cả đã đọc"
            accessibilityState={{ disabled: markingAll, busy: markingAll }}
            style={({ pressed }) => [styles.markAll, pressed && styles.pressed]}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color={Colors.authInk} />
            ) : (
              <Icon name="checkCheck" size={MARK_ALL_ICON} color={Colors.authInk} strokeWidth={2.2} />
            )}
          </Pressable>
        ) : null}
      </View>

      {subtitle ? (
        <Text
          style={[styles.subtitle, { marginLeft: textIndent, maxWidth: subtitleMaxWidth }]}
          accessibilityLiveRegion="polite"
          maxFontSizeMultiplier={1.4}
        >
          {subtitle}
        </Text>
      ) : loading ? (
        <Skeleton width={104} height={14} style={[styles.subtitleSkeleton, { marginLeft: textIndent }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -BACK_PULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  // Dòng cao 44pt (đệm 8 + 28) để chữ canh giữa nút quay lại.
  title: {
    flexShrink: 1,
    paddingVertical: 8,
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: Colors.authInk,
  },
  // Chỉ có hình, cùng kiểu nút quay lại ở góc đối diện; kéo sát lề phải để hai dấu
  // tích thẳng hàng mép phải của thẻ, vùng chạm vẫn đủ 44pt.
  markAll: {
    marginLeft: 'auto',
    marginRight: -BACK_PULL,
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authMuted,
  },
  subtitleSkeleton: { marginTop: 3 },
});
