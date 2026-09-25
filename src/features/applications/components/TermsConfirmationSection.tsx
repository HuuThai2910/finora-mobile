import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Card, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import { DECLINE_REASONS, type DeclineReasonCode } from '../constant';
import { useTermsConfirmation } from '../hook/useTermsConfirmation';
import DeclineForm from './DeclineForm';

export default function TermsConfirmationSection({
  application,
  onDone,
}: {
  application: LoanApplication;
  onDone: () => void;
}) {
  const action = useTermsConfirmation(application);
  const [mode, setMode] = useState<'review' | 'decline'>('review');
  const [reason, setReason] = useState<DeclineReasonCode>(DECLINE_REASONS[0].value);
  const [reasonDetail, setReasonDetail] = useState('');
  const confirmation = application.termsConfirmation;
  if (!confirmation || confirmation.status !== 'PENDING') return null;

  const accept = async () => {
    if (await action.accept()) {
      Alert.alert(
        'Đã chấp nhận điều khoản',
        'FINORA đang lập hợp đồng PDF theo đúng điều khoản bạn vừa xác nhận.',
        [{ text: 'Đã hiểu', onPress: onDone }],
      );
    }
  };

  const decline = async () => {
    if (reason === 'OTHER' && !reasonDetail.trim()) return;
    if (await action.decline(reason, reasonDetail)) {
      Alert.alert(
        'Đã từ chối điều khoản',
        'FINORA đã dừng bước lập hợp đồng cho hồ sơ này.',
        [{ text: 'Đã hiểu', onPress: onDone }],
      );
    }
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.eyebrow}>CẦN QUYẾT ĐỊNH CỦA BẠN</Text>
      <Text style={styles.title}>Điều khoản cuối bất lợi hơn lúc nộp hồ sơ</Text>
      <Text style={styles.body}>
        FINORA chưa tạo hợp đồng. Hãy đối chiếu lãi suất và lịch trả bên dưới rồi chọn chấp nhận
        hoặc từ chối. Không phản hồi không được xem là đồng ý.
      </Text>
      <InfoNote tone="warn">
        Hạn phản hồi: {new Date(confirmation.expiresAt).toLocaleString('vi-VN')}.
      </InfoNote>

      {mode === 'decline' ? (
        <>
          <DeclineForm
            reason={reason}
            onReasonChange={setReason}
            detail={reasonDetail}
            onDetailChange={setReasonDetail}
            error={action.error?.message}
          />
          <Button
            label="Xác nhận từ chối"
            variant="danger"
            onPress={() => void decline()}
            loading={action.declining}
            disabled={action.busy || (reason === 'OTHER' && !reasonDetail.trim())}
          />
          <Button
            label="Quay lại"
            variant="outline"
            onPress={() => {
              action.clearError();
              setMode('review');
            }}
            disabled={action.busy}
          />
        </>
      ) : (
        <>
          {action.error ? <InfoNote tone="warn">{action.error.message}</InfoNote> : null}
          <View style={styles.actions}>
            <Button
              label="Chấp nhận điều khoản mới"
              onPress={() => void accept()}
              loading={action.accepting}
              disabled={action.busy}
            />
            <Button
              label="Từ chối điều khoản"
              variant="outline"
              onPress={() => {
                action.clearError();
                setMode('decline');
              }}
              disabled={action.busy}
            />
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.lg, marginTop: Spacing.lg, borderLeftWidth: 4, borderLeftColor: Colors.amber },
  eyebrow: { ...Text_.captionBold, color: Colors.amber, letterSpacing: 0.6 },
  title: { ...Text_.title, color: Colors.ink },
  body: { ...Text_.micro, color: Colors.ink2, lineHeight: 21 },
  actions: { gap: Spacing.lg },
});
