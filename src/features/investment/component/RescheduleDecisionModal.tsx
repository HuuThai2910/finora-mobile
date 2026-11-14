import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { DetailButton, DetailNote } from '@/features/applications';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/theme';

type Props = {
  visible: boolean;
  approve: boolean;
  loanNumber?: string;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Hộp xác nhận dùng chung cho native và web. Không dùng `Alert.alert` vì
 * React Native Web không thực thi callback của các nút trong Alert.
 */
export default function RescheduleDecisionModal({
  visible,
  approve,
  loanNumber,
  busy,
  error,
  onCancel,
  onConfirm,
}: Props) {
  const title = approve ? 'Đồng ý cơ cấu lịch trả?' : 'Từ chối đề nghị cơ cấu?';
  const description = approve
    ? 'Sau khi toàn bộ nhà đầu tư đồng ý, hệ thống sẽ áp dụng lịch trả mới. Quyết định này không thể hoàn tác.'
    : 'Một nhà đầu tư từ chối sẽ kết thúc đề nghị; lịch trả hiện tại tiếp tục có hiệu lực.';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!busy) onCancel();
      }}
    >
      <View style={styles.overlay} accessibilityViewIsModal>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Đóng hộp xác nhận"
        />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {loanNumber ? <Text style={styles.loan}>Khoản vay {loanNumber}</Text> : null}
          <Text style={styles.description}>{description}</Text>
          {error ? <DetailNote tone="warn">{error}</DetailNote> : null}
          <View style={styles.actions}>
            <DetailButton
              label={approve ? 'Xác nhận đồng ý' : 'Xác nhận từ chối'}
              variant={approve ? 'primary' : 'danger'}
              onPress={onConfirm}
              loading={busy}
            />
            <DetailButton
              label="Quay lại"
              variant="outline"
              onPress={onCancel}
              disabled={busy}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.applyFormScrim,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    color: Colors.authInk,
  },
  loan: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authPrimary,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.authMuted,
  },
  actions: { gap: Spacing.sm, marginTop: Spacing.sm },
});
