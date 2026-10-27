import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, Card, InfoNote, SegmentGroup, type SegmentOption } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_, tabularNums } from '@/theme';
import { formatDong, formatLocalDate } from '@/utils/format';
import { useBalance } from '@/features/wallet';
import { usePinGuard } from '@/features/pin';
import { cancelPendingRepayment, createScheduledRepayment } from '../api/servicingApi';
import FinancialRows from '../components/FinancialRows';
import RepaymentResultCard from '../components/RepaymentResultCard';
import { useScheduledDue, useServicingLoan } from '../hooks/useLoanServicing';
import { useRepaymentTracking } from '../hooks/useRepaymentTracking';
import type { PendingRepayment, RepaymentResult } from '../types';

type Route = RouteProp<ProfileStackParamList, 'LoanPayment'>;

/** Quá hạn nhiều kỳ: trả toàn bộ phần quá hạn (mặc định) hoặc chỉ kỳ quá hạn cũ nhất (D26). */
type OverdueChoice = 'full' | 'oldest';

const OVERDUE_CHOICES: readonly SegmentOption<OverdueChoice>[] = [
  { value: 'full', label: 'Toàn bộ quá hạn' },
  { value: 'oldest', label: 'Chỉ kỳ cũ nhất' },
];

export default function LoanPaymentScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const nav = useNavigation();
  const state = useServicingLoan(loanNumber);
  const balance = useBalance();
  const due = useScheduledDue(state.data?.applicationId ?? null);
  // Mỗi lựa chọn số tiền là một ý định riêng: cùng key mà khác số tiền thì Payment từ chối (IDEMPOTENCY_KEY_REUSED).
  const keys = useRef<Record<OverdueChoice, string>>({ full: generateIdempotencyKey(), oldest: generateIdempotencyKey() }).current;
  // Lần hủy cũng có mã riêng để token PIN chỉ duyệt đúng lần hủy này (D38); hủy xong mới đổi mã.
  const cancelKey = useRef(generateIdempotencyKey());
  const [choice, setChoice] = useState<OverdueChoice>('full');
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<RepaymentResult | null>(null);
  const trackedResult = useRepaymentTracking(result);
  const { requirePin } = usePinGuard();

  if ((state.loading && !state.data) || (balance.loading && !balance.data) || (due.loading && !due.data)) return <Screen><PHeader title="Thanh toán khoản vay" back /><LoadingScreen cards={3} /></Screen>;
  if (state.error || !state.data) return <Screen><PHeader title="Thanh toán khoản vay" back /><ErrorState message={state.error ?? 'Không tải được khoản vay.'} onRetry={state.reload} /></Screen>;
  // Số tiền phải lấy từ Payment/Fineract: lệnh trả nợ chỉ được chấp nhận khi khớp đúng nghĩa vụ hiện tại.
  if (due.error || !due.data) return <Screen><PHeader title="Thanh toán khoản vay" back /><ErrorState message={due.error ?? 'Chưa tải được số tiền cần thanh toán.'} onRetry={due.reload} /></Screen>;

  const data = state.data;
  const loan = data.loan;
  const scheduled = due.data;
  const pending = scheduled.pending;
  const overdue = scheduled.overdueAmount > 0;
  const partialAmount = scheduled.partialOverdueAmount;
  const canPayOldest = overdue && partialAmount != null && partialAmount > 0 && partialAmount < scheduled.amount;
  const payOldest = canPayOldest && choice === 'oldest';
  const amount = payOldest && partialAmount != null ? partialAmount : scheduled.amount;
  const key = keys[payOldest ? 'oldest' : 'full'];
  const dueDate = scheduled.dueDate ?? loan.nextDueDate;
  const available = balance.data?.available ?? 0;
  const insufficient = available < amount;

  const submit = async () => {
    if (submitting || result || pending) return;
    setSubmitting(true); setError(null); setNotice(null);
    try {
      // Đóng bảng PIN là thôi thanh toán, không báo lỗi.
      const pinToken = await requirePin('REPAYMENT', key);
      if (!pinToken) return;
      setResult(await createScheduledRepayment(scheduled.loanApplicationId, amount, key, pinToken));
      balance.reload();
    } catch (reason) { setError(toUserMessage(reason)); }
    finally { setSubmitting(false); }
  };

  const cancel = async (value: PendingRepayment) => {
    if (cancelling) return;
    setCancelling(true); setError(null); setNotice(null);
    try {
      const pinToken = await requirePin('REPAYMENT', cancelKey.current);
      if (!pinToken) return;
      await cancelPendingRepayment(value.repaymentId, cancelKey.current, pinToken);
      cancelKey.current = generateIdempotencyKey();
      setNotice('Đã hủy khoản thanh toán chờ ghi nhận; tiền đã hoàn về ví. Kỳ này vẫn cần được thanh toán trước ngày đến hạn.');
      balance.reload();
      due.reload();
    } catch (reason) { setError(toUserMessage(reason)); }
    finally { setCancelling(false); }
  };

  const askCancel = (value: PendingRepayment) => Alert.alert(
    'Hủy khoản thanh toán chờ ghi nhận?',
    'Tiền hoàn về ví ngay. Nếu không thanh toán lại trước ngày đến hạn, kỳ này sẽ bị quá hạn.',
    [
      { text: 'Giữ khoản thanh toán', style: 'cancel' },
      { text: 'Hủy và hoàn tiền', style: 'destructive', onPress: () => void cancel(value) },
    ],
  );

  return (
    <Screen>
      <PHeader title={overdue ? 'Khắc phục quá hạn' : 'Thanh toán kỳ tới'} back hint={loan.loanNumber} />
      {trackedResult ? (
        <><RepaymentResultCard result={trackedResult} /><Button label="Về khoản vay" onPress={() => nav.goBack()} style={styles.button} /></>
      ) : pending ? (
        <>
          {/* Fineract chỉ biết khoản tiền khi đã ghi, nên kỳ vẫn hiện "chưa trả" cho tới ngày ghi nhận. */}
          <Card style={styles.hero}>
            <Text style={styles.heroLabel}>{pending.postOn ? 'ĐÃ THANH TOÁN, CHỜ GHI NHẬN' : 'ĐANG GHI NHẬN THANH TOÁN'}</Text>
            <Text style={styles.heroAmount}>{formatDong(pending.amount)}</Text>
            <Text style={styles.heroHint}>{pending.postOn ? `Ghi nhận vào kỳ ngày ${formatLocalDate(pending.postOn)}` : 'Đang cập nhật khoản vay'}</Text>
          </Card>
          <InfoNote>
            {pending.postOn
              ? 'Bạn đã thanh toán kỳ này trước ngày đến hạn. Khoản tiền được ghi nhận đúng ngày đến hạn nên lãi của kỳ giữ nguyên theo lịch; bạn không cần thanh toán thêm cho kỳ này.'
              : 'Khoản thanh toán đang được cập nhật vào khoản vay. Không thanh toán lại; hãy quay lại sau ít phút.'}
          </InfoNote>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {pending.cancellable ? (
            <Button label="Hủy và hoàn tiền về ví" variant="danger" loading={cancelling} onPress={() => askCancel(pending)} style={styles.button} />
          ) : null}
          <Button label="Về khoản vay" variant="outline" onPress={() => nav.goBack()} />
        </>
      ) : (
        <>
          {canPayOldest ? (
            <SegmentGroup
              label="Chọn số tiền thanh toán"
              options={OVERDUE_CHOICES}
              value={payOldest ? 'oldest' : 'full'}
              onChange={value => { setChoice(value); setError(null); }}
              style={styles.choice}
            />
          ) : null}
          <Card style={styles.hero}>
            <Text style={styles.heroLabel}>SỐ TIỀN THANH TOÁN</Text>
            <Text style={styles.heroAmount}>{formatDong(amount)}</Text>
            <Text style={styles.heroHint}>{overdue ? `Quá hạn ${loan.daysPastDue} ngày` : `Đến hạn ${dueDate ? formatLocalDate(dueDate) : '—'}`}</Text>
          </Card>
          <Card style={styles.detail}>
            <FinancialRows rows={[
              { label: 'Số dư ví khả dụng', value: available },
              { label: 'Dư nợ hiện tại', value: loan.totalOutstanding },
              ...(overdue ? [{ label: 'Trong đó quá hạn', value: scheduled.overdueAmount }] : []),
              { label: 'Khoản cần thanh toán', value: overdue ? 'Phần quá hạn cần thanh toán' : 'Kỳ trả nợ hiện tại' },
              ...(scheduled.postOn ? [{ label: 'Ghi nhận vào khoản vay', value: formatLocalDate(scheduled.postOn) }] : []),
            ]} />
          </Card>
          {payOldest ? (
            <InfoNote tone="warn">
              {`Bạn chỉ trả kỳ quá hạn cũ nhất. Khoản vay vẫn quá hạn với ${formatDong(scheduled.overdueAmount - amount)} còn lại và chỉ trở lại bình thường khi trả đủ toàn bộ phần quá hạn.`}
            </InfoNote>
          ) : null}
          {scheduled.postOn ? (
            <InfoNote>
              {`Bạn đang thanh toán trước ngày đến hạn. Tiền được trừ khỏi ví hôm nay và ghi nhận vào kỳ đúng ngày ${formatLocalDate(scheduled.postOn)}, nên lãi của kỳ giữ nguyên theo lịch. Muốn giảm lãi, hãy chọn trả trước một phần gốc.`}
            </InfoNote>
          ) : null}
          {notice ? <InfoNote tone="success">{notice}</InfoNote> : null}
          {insufficient ? <InfoNote tone="warn">Số dư ví chưa đủ. Hãy nạp thêm tiền trước khi xác nhận.</InfoNote> : null}
          {loan.stale ? <InfoNote tone="warn">Thông tin khoản vay vừa thay đổi. Hãy quay lại và làm mới trước khi thanh toán.</InfoNote> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Xác nhận thanh toán từ ví" loading={submitting} disabled={insufficient || amount <= 0 || loan.stale} onPress={submit} style={styles.button} />
          <InfoNote>Số tiền được lấy từ lịch trả nợ hiện tại. Hệ thống sẽ kiểm tra lại trước khi trừ tiền trong ví.</InfoNote>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  choice: { marginBottom: Spacing.lg },
  hero: { alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  heroLabel: { ...Text_.sectionLabel, color: Colors.authMuted },
  heroAmount: { ...Text_.hero, color: Colors.authInk, ...tabularNums },
  heroHint: { ...Text_.microBold, color: Colors.amber },
  detail: { marginBottom: Spacing.lg },
  error: { ...Text_.microBold, color: Colors.red, marginVertical: Spacing.lg },
  button: { marginVertical: Spacing.xl },
});
