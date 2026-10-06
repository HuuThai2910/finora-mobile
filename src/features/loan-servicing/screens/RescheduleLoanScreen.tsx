import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, Card, Checkbox, Field, InfoNote, SegmentGroup, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { useAsync } from '@/hooks/useAsync';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import { formatDateTime, formatLocalDate } from '@/utils/format';
import { getReschedulePolicy, listRescheduleRequests, submitRescheduleRequest } from '../api/servicingApi';
import {
  addMonths,
  isLocalDate,
  localDate,
  rescheduleStatusLabel,
  rescheduleStatusTone,
  rescheduleTypeLabel,
} from '../mappers/servicing';
import type { RescheduleRequest, RescheduleType } from '../types';

type Route = RouteProp<ProfileStackParamList, 'RescheduleLoan'>;

const OPTIONS = [
  { value: 'INSTALLMENT_ADJUSTMENT', label: 'Đổi ngày đến hạn' },
  { value: 'TERM_EXTENSION', label: 'Gia hạn số kỳ' },
] as const;

export default function RescheduleLoanScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const initialDate = localDate();
  const query = useAsync(async signal => {
    const [policy, history] = await Promise.all([
      getReschedulePolicy(signal), listRescheduleRequests(loanNumber, signal),
    ]);
    return { policy, history: history.data };
  }, [loanNumber]);
  const key = useRef(generateIdempotencyKey()).current;
  const [type, setType] = useState<RescheduleType>('TERM_EXTENSION');
  const [fromDate, setFromDate] = useState(initialDate);
  const [adjustedDate, setAdjustedDate] = useState(addMonths(initialDate, 1));
  const [extraTerms, setExtraTerms] = useState('1');
  const [reason, setReason] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<RescheduleRequest | null>(null);

  if (query.loading && !query.data) return <Screen><PHeader title="Cơ cấu khoản vay" back /><LoadingScreen cards={4} /></Screen>;
  if (query.error || !query.data) return <Screen><PHeader title="Cơ cấu khoản vay" back /><ErrorState message={query.error ?? 'Không tải được chính sách cơ cấu.'} onRetry={query.reload} /></Screen>;

  const data = query.data;
  const terms = Number(extraTerms);
  const validDate = isLocalDate(fromDate);
  const validSpecific = type === 'TERM_EXTENSION'
    ? Number.isInteger(terms) && terms > 0 && terms <= 120
    : isLocalDate(adjustedDate) && adjustedDate > fromDate;
  const valid = validDate && fromDate >= initialDate && validSpecific && reason.trim().length > 0 && reason.trim().length <= 500 && accepted;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true); setError(null);
    try {
      const result = await submitRescheduleRequest(loanNumber, {
        requestType: type,
        rescheduleFromDate: fromDate,
        ...(type === 'TERM_EXTENSION' ? { extraTerms: terms } : { adjustedDueDate: adjustedDate }),
        reasonComment: reason.trim(),
        confirmedTermsVersion: data.policy.termsVersion,
      }, key);
      setCreated(result); query.reload();
    } catch (cause) { setError(toUserMessage(cause)); }
    finally { setBusy(false); }
  };

  return (
    <Screen>
      <PHeader title="Cơ cấu khoản vay" back hint={loanNumber} />
      {created ? (
        <>
          <Card style={styles.card}>
            <View style={styles.row}><Text style={styles.title}>Đã gửi yêu cầu</Text><Tag tone="amber" small>Chờ duyệt</Tag></View>
            <Text style={styles.body}>Yêu cầu {created.requestType === 'TERM_EXTENSION' ? `gia hạn ${created.extraTerms} kỳ` : `đổi hạn tới ${formatLocalDate(created.adjustedDueDate ?? '')}`} đã được chuyển tới quản trị viên.</Text>
            <Text style={styles.meta}>Mã yêu cầu: {created.requestId}</Text>
          </Card>
          <InfoNote>Trong thời gian chờ duyệt, nghĩa vụ hiện tại vẫn giữ nguyên. Chỉ lịch do Fineract xác nhận sau duyệt mới có hiệu lực.</InfoNote>
        </>
      ) : (
        <>
          <Card style={styles.card}>
            <Text style={styles.title}>Hình thức đề nghị</Text>
            <SegmentGroup options={OPTIONS} value={type} onChange={setType} label="Chọn hình thức cơ cấu" />
              <Field label="Ngày bắt đầu áp dụng" value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" required helper="Không được trước ngày hiện tại." error={fromDate && (!validDate || fromDate < initialDate) ? 'Ngày phải đúng định dạng và không trước hôm nay.' : undefined} />
            {type === 'TERM_EXTENSION' ? (
              <Field label="Số kỳ muốn gia hạn" value={extraTerms} onChangeText={setExtraTerms} keyboardType="number-pad" required error={extraTerms && !validSpecific ? 'Nhập từ 1 đến 120 kỳ.' : undefined} />
            ) : (
              <Field label="Ngày đến hạn mới" value={adjustedDate} onChangeText={setAdjustedDate} placeholder="YYYY-MM-DD" required error={adjustedDate && !validSpecific ? 'Ngày mới phải sau ngày bắt đầu.' : undefined} />
            )}
            <Field label="Lý do đề nghị" value={reason} onChangeText={setReason} multiline required placeholder="Mô tả tình hình và phương án trả nợ" error={reason.length > 500 ? 'Lý do tối đa 500 ký tự.' : undefined} />
          </Card>
          <InfoNote>{data.policy.termsText}</InfoNote>
          <Checkbox checked={accepted} onChange={setAccepted} label="Xác nhận điều khoản cơ cấu">
            <Text style={styles.checkbox}>Tôi đã đọc và đồng ý điều khoản phiên bản {data.policy.termsVersion}.</Text>
          </Checkbox>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Gửi yêu cầu cơ cấu" loading={busy} disabled={!valid} onPress={submit} style={styles.action} />
        </>
      )}

      {data.history.length > 0 ? (
        <View style={styles.history}>
          <Text style={styles.section}>Yêu cầu gần đây</Text>
          {data.history.map(item => (
            <Card key={item.requestId} style={styles.historyCard}>
              <View style={styles.row}>
                <Text style={styles.historyTitle}>{rescheduleTypeLabel(item.requestType)}</Text>
                <Tag tone={rescheduleStatusTone(item.status)} small>{rescheduleStatusLabel(item.status)}</Tag>
              </View>
              <Text style={styles.meta}>{formatDateTime(item.createdAt)} · {item.reasonComment}</Text>
              {item.decisionComment ? <Text style={styles.decision}>Phản hồi: {item.decisionComment}</Text> : null}
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg },
  title: { ...Text_.title, color: Colors.authInk, flex: 1 },
  body: { ...Text_.micro, color: Colors.authMuted },
  meta: { ...Text_.caption, color: Colors.authMuted },
  checkbox: { ...Text_.micro, color: Colors.authInk },
  error: { ...Text_.microBold, color: Colors.red, marginTop: Spacing.lg },
  action: { marginVertical: Spacing.xl },
  history: { gap: Spacing.lg, marginTop: Spacing.xxl },
  section: { ...Text_.sectionLabel, color: Colors.authInk },
  historyCard: { gap: Spacing.md },
  historyTitle: { ...Text_.microBold, color: Colors.authInk, flex: 1 },
  decision: { ...Text_.caption, color: Colors.authNoteText },
});
