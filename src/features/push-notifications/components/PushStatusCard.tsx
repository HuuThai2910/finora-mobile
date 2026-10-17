import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Button, Card, Tag, type TagTone } from '@/components/ui';
import type { PushRegistrationState } from '../types';

type Props = {
  state: PushRegistrationState;
  onEnable: () => void;
  onOpenSystemSettings: () => void;
};

type Look = { tone: TagTone; label: string; message: string };

/**
 * Câu chữ theo trạng thái đăng ký. Nói thẳng lý do không nhận được push (chưa cấu hình, máy ảo, đang chạy dữ liệu
 * giả) thay vì chỉ "lỗi", để người dùng và người kiểm thử biết đó là giới hạn của bản cài chứ không phải mất thông báo.
 */
function look(state: PushRegistrationState): Look {
  switch (state.kind) {
    case 'registered':
      return { tone: 'green', label: 'ĐANG BẬT', message: 'Thiết bị này đang nhận thông báo đẩy của FINORA.' };
    case 'working':
      return { tone: 'gray', label: 'ĐANG KIỂM TRA', message: 'Đang kiểm tra quyền thông báo và đăng ký thiết bị…' };
    case 'denied':
      return {
        tone: 'amber',
        label: 'CHƯA CHO PHÉP',
        message: state.canAskAgain
          ? 'FINORA chưa được phép gửi thông báo đẩy tới thiết bị này.'
          : 'Bạn đã tắt thông báo của FINORA trong cài đặt máy. Mở cài đặt để bật lại.',
      };
    case 'not-configured':
      return {
        tone: 'gray',
        label: 'CHƯA CẤU HÌNH',
        message: 'Bản cài đặt này chưa cấu hình EAS projectId nên chưa nhận được thông báo đẩy.',
      };
    case 'unsupported':
      return { tone: 'gray', label: 'KHÔNG HỖ TRỢ', message: 'Nền tảng này không nhận được thông báo đẩy.' };
    case 'mocked':
      return {
        tone: 'gray',
        label: 'DỮ LIỆU GIẢ',
        message: 'Thông báo đang chạy dữ liệu giả nên không đăng ký thiết bị với máy chủ.',
      };
    case 'error':
      return { tone: 'red', label: 'CHƯA ĐĂNG KÝ ĐƯỢC', message: state.message };
    case 'idle':
      return { tone: 'gray', label: 'CHƯA BẬT', message: 'Bật để nhận thông báo đẩy khi có cập nhật quan trọng.' };
  }
}

/** Thẻ trạng thái thông báo đẩy của thiết bị, kèm đúng một hành động phù hợp (bật, thử lại, mở cài đặt máy). */
export default function PushStatusCard({ state, onEnable, onOpenSystemSettings }: Props) {
  const { tone, label, message } = look(state);
  const canEnable = state.kind === 'idle' || state.kind === 'error'
    || (state.kind === 'denied' && state.canAskAgain);
  const needsSystemSettings = state.kind === 'denied' && !state.canAskAgain;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Thông báo đẩy trên thiết bị này
        </Text>
        <Tag tone={tone}>{label}</Tag>
      </View>
      <Text style={styles.message}>{message}</Text>
      {canEnable ? (
        <Button
          label={state.kind === 'error' ? 'Thử lại' : 'Bật thông báo đẩy'}
          icon="bell"
          onPress={onEnable}
          style={styles.action}
        />
      ) : null}
      {needsSystemSettings ? (
        <Button label="Mở cài đặt máy" variant="outline" onPress={onOpenSystemSettings} style={styles.action} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  title: { ...Text_.bodyBold, color: Colors.ink, flexShrink: 1 },
  message: { ...Text_.caption, color: Colors.ink2 },
  action: { marginTop: Spacing.sm },
});
