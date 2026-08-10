import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Field } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import type { ActionError } from '../mappers/apiError';

type Props = {
  onWithdraw: (reason: string) => Promise<boolean>;
  submitting: boolean;
  error: ActionError | null;
  clearError: () => void;
};

/**
 * Rút hồ sơ là hành động không đảo ngược nên tách hẳn xuống cuối màn, cách xa
 * hành động chính, và phải qua một bước xác nhận trước khi gọi backend.
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
    <View style={styles.wrap}>
      <View style={styles.box}>
        <Text style={styles.title}>Không còn nhu cầu vay?</Text>
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
            {error ? <Text style={styles.error}>{error.message}</Text> : null}
            <Button
              label="Xác nhận rút hồ sơ"
              variant="danger"
              onPress={confirm}
              loading={submitting}
            />
            <Button
              label="Để sau"
              variant="outline"
              onPress={() => {
                setOpen(false);
                clearError();
              }}
              disabled={submitting}
            />
          </>
        ) : (
          <Button label="Rút hồ sơ vay" variant="danger" onPress={() => setOpen(true)} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: Spacing.section },
  box: {
    gap: Spacing.lg,
    padding: Spacing.xxl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.tagRedBorder,
    backgroundColor: Colors.card,
  },
  title: { ...Text_.bodyBold, color: Colors.ink },
  body: { ...Text_.micro, color: Colors.ink2 },
  error: { ...Text_.micro, color: Colors.red },
});
