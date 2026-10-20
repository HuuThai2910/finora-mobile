/** Cửa ra công khai của feature `push-notifications` (đăng ký thông báo đẩy và cài đặt theo nhóm). */
export { default as NotificationSettingsScreen } from './screens/NotificationSettingsScreen';
export { default as PushNotificationsBridge } from './components/PushNotificationsBridge';
export { unregisterPushDevice } from './lib/pushRegistration';
