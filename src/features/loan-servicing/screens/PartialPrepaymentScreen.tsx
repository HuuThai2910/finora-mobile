import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, Card, Field, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import { formatDong, formatDateTime, formatPercentValue } from '@/utils/format';
import { useBalance } from '@/features/wallet';
import { confirmPartialPrepayment, createPartialPrepaymentQuote } from '../api/servicingApi';
import FinancialRows from '../components/FinancialRows';
import RepaymentResultCard from '../components/RepaymentResultCard';
import { useServicingLoan } from '../hooks/useLoanServicing';
import { useRepaymentTracking } from '../hooks/useRepaymentTracking';
import { parseDong } from '../mappers/servicing';
import type { PartialPrepaymentQuote, RepaymentResult } from '../types';

type Route = RouteProp<ProfileStackParamList, 'PartialPrepayment'>;

export default function PartialPrepaymentScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const nav = useNavigation();
  const state = useServicingLoan(loanNumber);
  const balance = useBalance();
  const key = useRef(generateIdempotencyKey()).current;
  const [amountText, setAmountText] = useState('');
  const [quote, setQuote] = useState<PartialPrepaymentQuote | null>(null);
  const [result, setResult] = useState<RepaymentResult | null>(null);
  const trackedResult = useRepaymentTracking(result);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.loading && !state.data) return <Screen><PHeader title="Trả trước một phần" back /><LoadingScreen cards={3} /></Screen>;
  if (state.error || !state.data) return <Screen><PHeader title="Trả trước một phần" back /><ErrorState message={state.error ?? 'Không tải được khoản vay.'} onRetry={state.reload} /></Screen>;
  const data = state.data;
  const amount = parseDong(amountText);
  const invalidAmount = amount === null || amount <= 0 || amount >= data.loan.principalOutstanding;
  const insufficient = !!quote && (balance.data?.available ?? 0) < quote.totalAmount;

  const requestQuote = async () => {
    if (busy || invalidAmount || amount === null) return;
    setBusy(true); setError(null);
    try { setQuote(await createPartialPrepaymentQuote(data.applicationId, amount)); }
    catch (reason) { setError(toUserMessage(reason)); }
    finally { setBusy(false); }
  };
  const confirm = async () => {
    if (!quote || busy || insufficient || quote.status !== 'ACTIVE') return;
    setBusy(true); setError(null);
    try { setResult(await confirmPartialPrepayment(quote.quoteId, key)); balance.reload(); }
    catch (reason) { setError(toUserMessage(reason)); }
    finally { setBusy(false); }
  };

  return (
    <Screen>
      <PHeader title="Trả trước một phần gốc" back hint={loanNumber} />
      {trackedResult ? <><RepaymentResultCard result={trackedResult} /><Button label="Xem lịch mới" onPress={() => nav.goBack()} style={styles.action} /></> : quote ? (
        <>
          <Card style={styles.card}>
            <Text style={styles.title}>Báo giá trả trước</Text>
            <FinancialRows rows={[
              { label: 'Nghĩa vụ kỳ hiện tại', value: quote.scheduledDue },
              { label: 'Gốc trả trước thêm', value: quote.prepaidPrincipal },
              { label: `Phí trả trước (${formatPercentValue(quote.feeRate * 100)})`, value: quote.platformFee },
              { label: 'Tổng trừ từ ví', value: quote.totalAmount, emphasis: true },
              { label: 'Hết hiệu lực', value: formatDateTime(quote.expiresAt) },
            ]} />
          </Card>
          <InfoNote>Fineract chỉ sinh lịch mới sau khi giao dịch được ghi nhận. FINORA không dựng lịch giả trước thanh toán.</InfoNote>
          {insufficient ? <InfoNote tone="warn">Số dư ví không đủ cho tổng báo giá.</InfoNote> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Xác nhận trả trước" loading={busy} disabled={insufficient || quote.status !== 'ACTIVE'} onPress={confirm} style={styles.action} />
          <Button label="Nhập lại số tiền" variant="outline" disabled={busy} onPress={() => { setQuote(null); setError(null); }} />
        </>
      ) : (
        <>
          <Card style={styles.card}>
            <Text style={styles.title}>Số gốc muốn trả thêm</Text>
            <Text style={styles.hint}>Gốc còn lại: {formatDong(data.loan.principalOutstanding)}</Text>
            <Field label="Số tiền" value={amountText} onChangeText={value => setAmountText(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="Ví dụ: 5.000.000" required error={amountText && invalidAmount ? 'Số tiền phải lớn hơn 0 và nhỏ hơn gốc còn lại.' : undefined} />
          </Card>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Lập báo giá" loading={busy} disabled={invalidAmount || data.loan.stale} onPress={requestQuote} style={styles.action} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.lg },
  title: { ...Text_.title, color: Colors.authInk },
  hint: { ...Text_.micro, color: Colors.authMuted },
  error: { ...Text_.microBold, color: Colors.red, marginTop: Spacing.lg },
  action: { marginVertical: Spacing.xl },
});
