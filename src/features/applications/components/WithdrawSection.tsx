import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Field } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import type { ActionError } from '../mappers/apiError';
import DetailButton from './DetailButton';
import DetailCard from './DetailCard';

type Props = {
  onWithdraw: (reason: string) => Promise<boolean>;
  submitting: boolean;
  error: ActionError | null;
  clearError: () => void;
  /** Hồ sơ đã duyệt nhưng listing còn mở: hủy gọi vốn và nhả tiền nhà đầu tư thay vì xóa quyết định duyệt. */
  fundingWithdrawal?: boolean;
};

/**
 * Rút hồ sơ là hành động không đảo ngược nên tách hẳn xuống cuối màn, cách xa
 * hành động chính, và phải qua một bước xác nhận trước khi gọi backend. Thẻ giữ
 * giọng trầm (không nền đỏ); chỉ nút mới mang màu đỏ để báo đây là thao tác phá huỷ.
 */
export default function WithdrawSection({
  onWithdraw,
  submitting,
  error,
  clearError,
  fundingWithdrawal = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  const confirm = async () => {
    const done = await onWithdraw(reason);
    if (done) {
      setOpen(false);
      setReason('');
    }
  };

  if (!open) {
    return (
      <View style={styles.collapsed}>
        <DetailButton
          label="Rút hồ sơ vay"
          variant="outline"
          icon="x"
          onPress={() => setOpen(true)}
          accessibilityLabel="Mở phần rút hồ sơ vay"
        />
      </View>
    );
  }

  return (
    <DetailCard title="Rút hồ sơ vay" style={styles.card}>
      <Text style={styles.body}>
        {fundingWithdrawal
          ? 'Đợt gọi vốn sẽ dừng và tiền đang giữ được trả về ví nhà đầu tư. Hồ sơ không thể tiếp tục giải ngân.'
          : 'Hồ sơ sẽ dừng vĩnh viễn. Nếu vẫn cần vay, bạn phải nộp hồ sơ mới.'}
      </Text>

      <Field
        label="Lý do rút hồ sơ"
        value={reason}
        onChangeText={value => {
          setReason(value);
          if (error) clearError();
        }}
        placeholder="Không bắt buộc"
        helper="Không nhập thông tin nhạy cảm."
        multiline
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error.message}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <DetailButton
          label="Xác nhận rút hồ sơ"
          variant="danger"
          onPress={() => void confirm()}
          loading={submitting}
        />
        <DetailButton
          label="Quay lại"
          variant="outline"
          onPress={() => {
            setOpen(false);
            clearError();
          }}
          disabled={submitting}
        />
      </View>
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  collapsed: { marginTop: Spacing.lg },
  // Tách hẳn khỏi các thẻ thông tin phía trên để nút phá huỷ không nằm sát nút xem lịch trả.
  card: { marginTop: Spacing.lg },
  body: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  error: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.red },
  actions: { gap: 10 },
});
