import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { navigationRef } from '@/navigation/navigationRef';
import { registerForPush } from '../lib/pushRegistration';

const NAVIGATION_RETRY_MS = 200;
const NAVIGATION_RETRIES = 10;

/**
 * Việc nền của thông báo đẩy trong suốt phiên đăng nhập (mount một lần dưới `RootNavigator` khi có phiên):
 * - đăng ký thiết bị lúc mở phiên, chỉ tự hỏi quyền lần đầu trên máy;
 * - đăng ký lại khi hệ điều hành đổi push token;
 * - app đang mở: hiện banner, không âm thanh/badge;
 * - chạm vào push (kể cả lúc app đang tắt): mở hộp thư Thông báo, nơi có nội dung đầy đủ.
 * Unmount khi đăng xuất nên mọi listener được gỡ cùng phiên.
 */
export function usePushNotificationsBridge(): void {
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    return () => Notifications.setNotificationHandler(null);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    void registerForPush('once');
    // Listener nhận token thiết bị (APNs/FCM), không phải Expo token: chỉ dùng làm tín hiệu để xin lại Expo token.
    const tokenChanged = Notifications.addPushTokenListener(() => {
      void registerForPush('never');
    });
    return () => tokenChanged.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    let cancelled = false;
    const open = () => openInbox(() => cancelled, 0);
    const tapped = Notifications.addNotificationResponseReceivedListener(open);
    // App được mở bằng cách chạm vào push khi đang tắt hẳn.
    if (Notifications.getLastNotificationResponse()) {
      open();
      Notifications.clearLastNotificationResponse();
    }
    return () => {
      cancelled = true;
      tapped.remove();
    };
  }, []);
}

/**
 * Mở hộp thư. Khi app vừa khởi động, cây điều hướng có thể chưa sẵn sàng: thử lại vài lần ngắn rồi thôi, người dùng
 * vẫn ở trang chủ và thấy chấm thông báo chưa đọc.
 */
function openInbox(isCancelled: () => boolean, attempt: number): void {
  if (isCancelled()) return;
  if (navigationRef.isReady()) {
    navigationRef.navigate('Trang chủ', { screen: 'Notifications' });
    return;
  }
  if (attempt < NAVIGATION_RETRIES) {
    setTimeout(() => openInbox(isCancelled, attempt + 1), NAVIGATION_RETRY_MS);
  }
}
