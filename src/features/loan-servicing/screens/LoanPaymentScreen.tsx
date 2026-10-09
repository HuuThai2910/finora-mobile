import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, Card, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_, tabularNums } from '@/theme';
import { formatDong, formatLocalDate } from '@/utils/format';
import { useBalance } from '@/features/wallet';
import { usePinGuard } from '@/features/pin';
import { createScheduledRepayment } from '../api/servicingApi';
import FinancialRows from '../components/FinancialRows';
import RepaymentResultCard from '../components/RepaymentResultCard';
import { useServicingLoan } from '../hooks/useLoanServicing';
import { useRepaymentTracking } from '../hooks/useRepaymentTracking';
import type { RepaymentResult } from '../types';

type Route = RouteProp<ProfileStackParamList, 'LoanPayment'>;

export default function LoanPaymentScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const nav = useNavigation();
  const state = useServicingLoan(loanNumber);
  const balance = useBalance();
  const key = useRef(generateIdempotencyKey()).current;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepaymentResult | null>(null);
  const trackedResult = useRepaymentTracking(result);
  const { requirePin } = usePinGuard();

  if ((state.loading && !state.data) || (balance.loading && !balance.data)) return <Screen><PHeader title="Thanh toán khoản vay" back /><LoadingScreen cards={3} /></Screen>;
  if (state.error || !state.data) return <Screen><PHeader title="Thanh toán khoản vay" back /><ErrorState message={state.error ?? 'Không tải được khoản vay.'} onRetry={state.reload} /></Screen>;

  const data = state.data;
  const loan = data.loan;
  const amount = loan.overdueAmount > 0 ? loan.overdueAmount : loan.nextDueAmount;
  const available = balance.data?.available ?? 0;
  const insufficient = available < amount;

  const submit = async () => {
    if (submitting || result) return;
    setSubmitting(true); setError(null);
    try {
      // Đóng bảng PIN là thôi thanh toán, không báo lỗi.
      const pinToken = await requirePin('REPAYMENT');
      if (!pinToken) return;
      setResult(await createScheduledRepayment(data.applicationId, amount, key, pinToken));
      balance.reload();
    } catch (reason) { setError(toUserMessage(reason)); }
    finally { setSubmitting(false); }
  };

  return (
    <Screen>
      <PHeader title={loan.overdueAmount > 0 ? 'Khắc phục quá hạn' : 'Thanh toán kỳ tới'} back hint={loan.loanNumber} />
      {trackedResult ? (
        <><RepaymentResultCard result={trackedResult} /><Button label="Về khoản vay" onPress={() => nav.goBack()} style={styles.button} /></>
      ) : (
        <>
          <Card style={styles.hero}>
            <Text style={styles.heroLabel}>SỐ TIỀN THANH TOÁN</Text>
            <Text style={styles.heroAmount}>{formatDong(amount)}</Text>
            <Text style={styles.heroHint}>{loan.overdueAmount > 0 ? `Quá hạn ${loan.daysPastDue} ngày` : `Đến hạn ${loan.nextDueDate ? formatLocalDate(loan.nextDueDate) : '—'}`}</Text>
          </Card>
          <Card style={styles.detail}>
            <FinancialRows rows={[
              { label: 'Số dư ví khả dụng', value: available },
              { label: 'Dư nợ hiện tại', value: loan.totalOutstanding },
              { label: 'Nguồn số tiền', value: loan.overdueAmount > 0 ? 'Nghĩa vụ quá hạn từ Fineract' : 'Kỳ đến hạn từ Fineract' },
            ]} />
          </Card>
          {insufficient ? <InfoNote tone="warn">Số dư ví chưa đủ. Hãy nạp thêm tiền trước khi xác nhận.</InfoNote> : null}
          {loan.stale ? <InfoNote tone="warn">Dữ liệu khoản vay đang cũ. Hãy quay lại và làm mới trước khi thanh toán.</InfoNote> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Xác nhận thanh toán từ ví" loading={submitting} disabled={insufficient || amount <= 0 || loan.stale} onPress={submit} style={styles.button} />
          <InfoNote>Backend chỉ chấp nhận đúng nghĩa vụ hiện tại từ Fineract; giao dịch sai số tiền sẽ bị từ chối trước khi trừ ví.</InfoNote>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  heroLabel: { ...Text_.sectionLabel, color: Colors.authMuted },
  heroAmount: { ...Text_.hero, color: Colors.authInk, ...tabularNums },
  heroHint: { ...Text_.microBold, color: Colors.amber },
  detail: { marginBottom: Spacing.lg },
  error: { ...Text_.microBold, color: Colors.red, marginVertical: Spacing.lg },
  button: { marginVertical: Spacing.xl },
});
