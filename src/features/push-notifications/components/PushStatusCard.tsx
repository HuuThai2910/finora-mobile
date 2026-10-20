import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, LineHeight, Radius, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';
import type { PushRegistrationState } from '../types';
import SettingsGroupCard from './SettingsGroupCard';
import SettingsTileRow from './SettingsTileRow';

type Props = {
  state: PushRegistrationState;
  onEnable: () => void;
  onOpenSystemSettings: () => void;
};

type Badge = { icon: IconName; background: string; foreground: string };
type Look = { badge: Badge; label: string; message: string };

const GREEN: Badge = { icon: 'circleCheck', background: Colors.tintGreen, foreground: Colors.tagGreenText };
const AMBER: Badge = { icon: 'shieldAlert', background: Colors.amberBg, foreground: Colors.tagAmberText };
const RED: Badge = { icon: 'alert', background: Colors.redBg, foreground: Colors.tagRedText };
const gray = (icon: IconName): Badge => ({ icon, background: Colors.surfaceMuted, foreground: Colors.authMuted });

/**
 * Câu chữ theo trạng thái đăng ký. Nói thẳng lý do không nhận được push (chưa cấu hình, máy ảo, đang chạy dữ liệu
 * giả) thay vì chỉ "lỗi", để người dùng và người kiểm thử biết đó là giới hạn của bản cài chứ không phải mất thông báo.
 * Nhãn có icon và chữ, màu chỉ bổ trợ (cùng kiểu nhãn định danh ở màn Hồ sơ).
 */
function look(state: PushRegistrationState): Look {
  switch (state.kind) {
    case 'registered':
      return { badge: GREEN, label: 'ĐANG BẬT', message: 'Thiết bị này đang nhận thông báo đẩy của FINORA.' };
    case 'working':
      return {
        badge: { icon: 'refreshCw', background: Colors.tintBlue, foreground: Colors.authPrimary },
        label: 'ĐANG KIỂM TRA',
        message: 'Đang kiểm tra quyền thông báo và đăng ký thiết bị…',
      };
    case 'denied':
      return {
        badge: AMBER,
        label: 'CHƯA CHO PHÉP',
        message: state.canAskAgain
          ? 'FINORA chưa được phép gửi thông báo đẩy tới thiết bị này.'
          : 'Bạn đã tắt thông báo của FINORA trong cài đặt máy. Mở cài đặt để bật lại.',
      };
    case 'not-configured':
      return {
        badge: gray('fileCog'),
        label: 'CHƯA CẤU HÌNH',
        message: 'Bản cài đặt này chưa cấu hình EAS projectId nên chưa nhận được thông báo đẩy.',
      };
    case 'unsupported':
      return { badge: gray('circleX'), label: 'KHÔNG HỖ TRỢ', message: 'Nền tảng này không nhận được thông báo đẩy.' };
    case 'mocked':
      return {
        badge: gray('database'),
        label: 'DỮ LIỆU GIẢ',
        message: 'Thông báo đang chạy dữ liệu giả nên không đăng ký thiết bị với máy chủ.',
      };
    case 'error':
      return { badge: RED, label: 'CHƯA ĐĂNG KÝ ĐƯỢC', message: state.message };
    case 'idle':
      return { badge: gray('bell'), label: 'CHƯA BẬT', message: 'Bật để nhận thông báo đẩy khi có cập nhật quan trọng.' };
  }
}

/** Nhãn trạng thái viên thuốc chữ hoa; trình đọc màn hình đọc cả câu trạng thái cho tự nhiên. */
function StatusBadge({ badge, label }: { badge: Badge; label: string }) {
  return (
    <View
      style={[styles.pill, { backgroundColor: badge.background }]}
      accessible
      accessibilityLabel={`Thông báo đẩy trên thiết bị này: ${label.toLowerCase()}`}
    >
      <Icon name={badge.icon} size={13} color={badge.foreground} strokeWidth={2.2} />
      <Text style={[styles.pillLabel, { color: badge.foreground }]} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Thẻ trạng thái thông báo đẩy của thiết bị, kèm đúng một hành động phù hợp (bật, thử lại, mở cài đặt máy) dưới dạng
 * dòng cài đặt có mũi tên như màn Hồ sơ.
 */
export default function PushStatusCard({ state, onEnable, onOpenSystemSettings }: Props) {
  const { badge, label, message } = look(state);
  const canEnable = state.kind === 'idle' || state.kind === 'error'
    || (state.kind === 'denied' && state.canAskAgain);
  const needsSystemSettings = state.kind === 'denied' && !state.canAskAgain;

  return (
    <SettingsGroupCard icon="bell" title="Thông báo đẩy trên thiết bị này">
      <SettingsTileRow icon="phone" title={<StatusBadge badge={badge} label={label} />} subtitle={message} />
      {canEnable ? (
        <SettingsTileRow
          icon={state.kind === 'error' ? 'refreshCw' : 'bell'}
          title={state.kind === 'error' ? 'Thử lại' : 'Bật thông báo đẩy'}
          subtitle="Cho phép và đăng ký thiết bị này với FINORA"
          onPress={onEnable}
          accessibilityLabel={state.kind === 'error' ? 'Thử lại đăng ký thông báo đẩy' : 'Bật thông báo đẩy'}
          divider
        />
      ) : null}
      {needsSystemSettings ? (
        <SettingsTileRow
          icon="fileCog"
          title="Mở cài đặt máy"
          subtitle="Bật lại quyền thông báo cho FINORA"
          onPress={onOpenSystemSettings}
          accessibilityLabel="Mở cài đặt máy"
          accessibilityHint="Mở phần cài đặt thông báo của hệ điều hành"
          divider
        />
      ) : null}
    </SettingsGroupCard>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: Spacing.xs,
    paddingLeft: 7,
    paddingRight: 9,
    paddingVertical: 3,
    marginBottom: Spacing.xxs,
    borderRadius: Radius.pill,
  },
  pillLabel: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    // Chữ hoa có dấu cần dòng cao hơn để Android không cắt ngọn dấu.
    lineHeight: lh(10.5, LineHeight.heading),
    letterSpacing: 0.4,
  },
});
