import { usePushNotificationsBridge } from '../hooks/usePushNotificationsBridge';

/** Không vẽ gì: chỉ giữ việc nền của thông báo đẩy sống cùng phiên đăng nhập. */
export default function PushNotificationsBridge() {
  usePushNotificationsBridge();
  return null;
}
