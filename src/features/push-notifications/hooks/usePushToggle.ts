import { Alert, Linking } from 'react-native';
import { registerForPush } from '../lib/pushRegistration';
import { usePushRegistrationState } from '../lib/registrationStore';
import { useNotificationPreferences } from './useNotificationPreferences';

export type PushToggleState = {
  value: boolean;
  disabled: boolean;
  /** Dòng phụ dưới tên công tắc: trạng thái hiện tại hoặc lỗi lưu. */
  subtitle: string;
  onChange: (next: boolean) => void;
};

/**
 * Công tắc thông báo đẩy đặt thẳng trên màn Hồ sơ, không qua màn cài đặt riêng. Gộp hai phần: tùy chọn push của tài
 * khoản trên máy chủ (`useNotificationPreferences`) và quyền thông báo của máy này (`registerForPush`).
 *
 * Bật công tắc thì vừa lưu tùy chọn vừa xin quyền/đăng ký máy; máy đã chặn hẳn (không hỏi lại được) thì mời mở Cài
 * đặt hệ thống, vì app không tự bật được quyền đó. Tắt công tắc chỉ lưu tùy chọn, không gỡ đăng ký máy.
 */
export function usePushToggle(): PushToggleState {
  const preferences = useNotificationPreferences();
  const registration = usePushRegistrationState();
  const blocked = registration.kind === 'denied' && !registration.canAskAgain;

  const onChange = (next: boolean) => {
    preferences.toggle(next);
    if (!next) return;
    if (blocked) {
      Alert.alert(
        'Máy đang chặn thông báo',
        'Hãy cho phép FINORA gửi thông báo trong Cài đặt của điện thoại để nhận thông báo đẩy.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Mở Cài đặt', onPress: () => void Linking.openSettings() },
        ],
      );
      return;
    }
    void registerForPush('always');
  };

  const subtitle = (() => {
    if (preferences.phase === 'loading') return 'Đang tải…';
    if (preferences.phase === 'error') return 'Chưa tải được cài đặt, thử lại sau';
    if (preferences.saveError) return preferences.saveError;
    if (preferences.readOnly) return 'Dữ liệu giả: công tắc chỉ để xem';
    if (preferences.pushEnabled && registration.kind === 'denied') {
      return blocked ? 'Máy đang chặn thông báo của FINORA' : 'Máy chưa cho phép thông báo';
    }
    return preferences.pushEnabled ? 'Đang nhận thông báo đẩy' : 'Đang tắt thông báo đẩy';
  })();

  return {
    value: preferences.pushEnabled,
    disabled: preferences.phase !== 'ready' || preferences.readOnly || preferences.saving,
    subtitle,
    onChange,
  };
}
