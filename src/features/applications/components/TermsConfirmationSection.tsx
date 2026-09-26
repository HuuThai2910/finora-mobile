import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Icon, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import { formatDateTime } from '@/utils/format';
import { DECLINE_REASONS, type DeclineReasonCode } from '../constant';
import { useTermsConfirmation } from '../hook/useTermsConfirmation';
import DeclineForm from './DeclineForm';
import DetailButton from './DetailButton';
import DetailCard from './DetailCard';

/**
 * Điều khoản cuối bất lợi hơn lúc nộp: borrower phải chủ động chấp nhận hoặc từ
 * chối trước khi FINORA lập hợp đồng. Vẽ theo ngôn ngữ thẻ của màn chi tiết
 * (mockup 26/09/2026); hạn phản hồi đặt trong dải nền vàng nhạt vì đây là mốc
 * duy nhất trên màn có thể làm hồ sơ dừng lại nếu bỏ lỡ.
 */
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
    <DetailCard title="Cần quyết định của bạn" badge={{ icon: 'alert', color: Colors.amber }}>
      <View style={styles.copy}>
        <Text style={styles.lead}>Điều khoản cuối bất lợi hơn lúc nộp hồ sơ</Text>
        <Text style={styles.body}>
          FINORA chưa tạo hợp đồng. Hãy đối chiếu lãi suất và lịch trả bên dưới rồi chọn chấp nhận
          hoặc từ chối. Không phản hồi không được xem là đồng ý.
        </Text>
      </View>

      <View style={styles.deadline}>
        <Icon name="clock" size={16} color={Colors.tagAmberText} />
        <Text style={styles.deadlineText}>
          Hạn phản hồi: {formatDateTime(confirmation.expiresAt)}
        </Text>
      </View>

      {mode === 'decline' ? (
        <>
          <DeclineForm
            reason={reason}
            onReasonChange={setReason}
            detail={reasonDetail}
            onDetailChange={setReasonDetail}
            error={action.error?.message}
          />
          <View style={styles.actions}>
            <DetailButton
              label="Xác nhận từ chối"
              variant="danger"
              onPress={() => void decline()}
              loading={action.declining}
              disabled={action.busy || (reason === 'OTHER' && !reasonDetail.trim())}
            />
            <DetailButton
              label="Quay lại"
              variant="outline"
              onPress={() => {
                action.clearError();
                setMode('review');
              }}
              disabled={action.busy}
            />
          </View>
        </>
      ) : (
        <>
          {action.error ? <InfoNote tone="warn">{action.error.message}</InfoNote> : null}
          <View style={styles.actions}>
            <DetailButton
              label="Chấp nhận điều khoản mới"
              onPress={() => void accept()}
              loading={action.accepting}
              disabled={action.busy}
            />
            <DetailButton
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
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  copy: { gap: Spacing.xs },
  lead: { fontFamily: FontFamily.semibold, fontSize: 14.5, lineHeight: 21, color: Colors.authInk },
  body: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.amberBg,
  },
  deadlineText: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.tagAmberText,
  },
  actions: { gap: 10 },
});
