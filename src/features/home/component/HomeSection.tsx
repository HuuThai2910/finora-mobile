import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, SoftShadow } from '@/theme';
import { Icon } from '@/components/ui';
import { Skeleton } from '@/components/feedback';

type Props = {
  /** Viết thường như câu; kiểu chữ tự in hoa để trình đọc màn hình vẫn đọc tự nhiên. */
  title: string;
  /** Mở danh sách đầy đủ. Bỏ trống khi chưa có gì để xem thêm (rỗng, lỗi). */
  onSeeAll?: () => void;
  /** Nhãn cho trình đọc màn hình, cụ thể hơn chữ "Xem tất cả" trên màn. */
  seeAllLabel?: string;
  children: React.ReactNode;
};

/** Thẻ trắng một mục của trang chủ: tiêu đề in hoa, liên kết "Xem tất cả", các dòng dữ liệu. */
export default function HomeSection({ title, onSeeAll, seeAllLabel, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.3}>
          {title}
        </Text>
        {onSeeAll ? (
          <Pressable
            onPress={onSeeAll}
            // Chữ chỉ cao ~18pt; nới vùng chạm theo chiều dọc cho đủ 44pt.
            hitSlop={{ top: 13, bottom: 13, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={seeAllLabel ?? 'Xem tất cả'}
            style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
          >
            <Text style={styles.seeAllText} maxFontSizeMultiplier={1.3}>
              Xem tất cả
            </Text>
            <Icon name="chevronRight" size={14} color={Colors.authPrimary} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

type MessageProps = {
  text: string;
  /** Mọi thông báo rỗng/lỗi đều chỉ ra việc làm tiếp theo. */
  actionLabel: string;
  onAction: () => void;
};

/** Dòng báo rỗng hoặc lỗi nằm gọn trong thẻ, không chiếm cả màn như `ErrorState`. */
export function SectionMessage({ text, actionLabel, onAction }: MessageProps) {
  return (
    <View style={styles.message} accessibilityLiveRegion="polite">
      <Text style={styles.messageText}>{text}</Text>
      <Pressable
        onPress={onAction}
        hitSlop={{ top: 12, bottom: 12 }}
        accessibilityRole="button"
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Text style={styles.messageAction}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

/** Dòng giả lúc đang tải, cao đúng bằng dòng thật để thẻ không nhảy khi dữ liệu về. */
export function RowSkeleton({ round = false }: { round?: boolean }) {
  return (
    <View style={styles.skeletonRow}>
      <Skeleton width={42} height={42} radius={round ? 21 : 12} />
      <View style={styles.skeletonText}>
        <Skeleton height={14} width="70%" />
        <Skeleton height={12} width="40%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
    ...SoftShadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 28,
    marginBottom: 4,
  },
  title: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: Colors.authInk,
  },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.authPrimary,
  },
  pressed: { opacity: 0.6 },
  message: { paddingVertical: 12, gap: 6, alignItems: 'flex-start' },
  messageText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authMuted,
  },
  messageAction: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authPrimary,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: MIN_TOUCH,
    paddingVertical: 8,
  },
  skeletonText: { flex: 1, gap: 8 },
});
