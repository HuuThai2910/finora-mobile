import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveBackdrop } from '@/components/phone';
import { NOTIFICATIONS_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import { NOTIFICATIONS_MAX_WIDTH, NOTIFICATIONS_PADDING } from '../constant';
import { useNotificationFeed } from '../hook/useNotificationFeed';
import NotificationActionError from './NotificationActionError';
import NotificationCard from './NotificationCard';
import NotificationListSkeleton from './NotificationListSkeleton';
import NotificationListStatus from './NotificationListStatus';
import NotificationsHeader from './NotificationsHeader';

/** Chừa đủ chỗ dưới thẻ cuối để lớp sóng đáy (mây, lá) lộ ra như trang chủ. */
const BOTTOM_SPACE = 96;

/**
 * Màn 9 — trung tâm thông báo, cùng bộ với "Lịch sử ví" và "Hợp đồng của tôi":
 * nền minh hoạ robot hộp quà, tin nhóm theo ngày, mỗi tin một thẻ; tin chưa đọc
 * có chấm đỏ. Tối đa 50 tin nên vẽ bằng ScrollView để nền cuộn cùng nội dung.
 */
export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, NOTIFICATIONS_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để lớp sóng đáy nằm sát đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);

  const feed = useNotificationFeed();

  const renderBody = () => {
    if (feed.phase === 'loading') return <NotificationListSkeleton />;
    if (feed.phase === 'error') {
      return (
        <NotificationListStatus
          kind="error"
          message={feed.error ?? 'Không tải được thông báo.'}
          onRetry={feed.refresh}
        />
      );
    }
    if (feed.counts.all === 0) return <NotificationListStatus kind="empty" />;
    return feed.groups.map(group => (
      <View key={group.key} style={styles.group}>
        <Text style={styles.day} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          {group.title}
        </Text>
        {group.items.map(item => (
          <NotificationCard key={item.id} item={item} onMarkRead={feed.markRead} />
        ))}
      </View>
    ));
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
      refreshControl={
        <RefreshControl
          // Lần tải đầu đã có khung giả; vòng xoay chỉ dành cho kéo làm mới.
          refreshing={feed.refreshing}
          onRefresh={feed.refresh}
          // iOS đọc `tintColor`, Android đọc `colors`.
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={NOTIFICATIONS_WAVES} width={width} />
        <View style={styles.content}>
          <NotificationsHeader
            width={width}
            topInset={insets.top}
            loading={feed.phase === 'loading'}
            counts={feed.phase === 'ready' ? feed.counts : null}
            markingAll={feed.markingAll}
            onMarkAllRead={feed.markAllRead}
          />
          <View style={styles.list}>
            {feed.actionError ? <NotificationActionError message={feed.actionError} /> : null}
            {renderBody()}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trơn của ảnh: phủ hai bên cột trên web rộng và lót lúc ảnh chưa nạp xong.
  root: { flex: 1, backgroundColor: Colors.notificationsFillTop },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { paddingHorizontal: NOTIFICATIONS_PADDING, paddingBottom: BOTTOM_SPACE },
  list: { gap: Spacing.xl },
  group: { gap: Spacing.md },
  day: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authMuted,
    marginBottom: Spacing.xs,
  },
});
