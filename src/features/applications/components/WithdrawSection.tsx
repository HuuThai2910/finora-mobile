import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
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
};

/**
 * Rút hồ sơ là hành động không đảo ngược nên tách hẳn xuống cuối màn, cách xa
 * hành động chính, và phải qua một bước xác nhận trước khi gọi backend. Thẻ giữ
 * giọng trầm (không nền đỏ); chỉ nút mới mang màu đỏ để báo đây là thao tác phá huỷ.
 */
export default function WithdrawSection({ onWithdraw, submitting, error, clearError }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  const confirm = () => {
    Alert.alert(
      'Rút hồ sơ vay?',
      'FINORA sẽ dừng xử lý hồ sơ này và bạn không thể khôi phục lại. Nếu vẫn cần vay, bạn sẽ phải nộp hồ sơ mới.',
      [
        { text: 'Giữ hồ sơ', style: 'cancel' },
        {
          text: 'Rút hồ sơ',
          style: 'destructive',
          onPress: () => {
            void onWithdraw(reason).then(done => {
              if (done) {
                setOpen(false);
                setReason('');
              }
            });
          },
        },
      ],
    );
  };

  return (
    <DetailCard title="Không còn nhu cầu vay?" style={styles.card}>
      <Text style={styles.body}>
        Bạn có thể rút hồ sơ trong lúc FINORA còn đang xử lý. Sau khi rút, hồ sơ này dừng lại vĩnh viễn.
      </Text>

      {open ? (
        <>
          <Field
            label="Lý do rút hồ sơ"
            value={reason}
            onChangeText={value => {
              setReason(value);
              if (error) clearError();
            }}
            placeholder="Không bắt buộc"
            helper="Lý do giúp FINORA cải thiện sản phẩm, bạn có thể bỏ trống."
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
              onPress={confirm}
              loading={submitting}
            />
            <DetailButton
              label="Để sau"
              variant="outline"
              onPress={() => {
                setOpen(false);
                clearError();
              }}
              disabled={submitting}
            />
          </View>
        </>
      ) : (
        <DetailButton label="Rút hồ sơ vay" variant="danger" onPress={() => setOpen(true)} />
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  // Tách hẳn khỏi các thẻ thông tin phía trên để nút phá huỷ không nằm sát nút xem lịch trả.
  card: { marginTop: Spacing.lg },
  body: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  error: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.red },
  actions: { gap: 10 },
});
