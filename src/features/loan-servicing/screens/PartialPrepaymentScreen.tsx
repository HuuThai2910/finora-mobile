import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ApplicationDetailError, DetailButton, DetailCard, DetailNote } from '@/features/applications';
import { Field } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { ApiError, generateIdempotencyKey, toUserMessage } from '@/lib/api';
import type { ProfileStackParamList } from '@/navigation/types';
import { FontFamily, Spacing } from '@/theme';
import { formatDong, formatDateTime } from '@/utils/format';
import { useBalance } from '@/features/wallet';
import { usePinGuard } from '@/features/pin';
import { confirmPartialPrepayment, createPartialPrepaymentQuote } from '../api/servicingApi';
import FinancialRows from '../components/FinancialRows';
import { feePolicyNote, feeRows } from '../mappers/fee';
import LoanDetailSkeleton from '../components/LoanDetailSkeleton';
import RepaymentResultCard from '../components/RepaymentResultCard';
import ServicingScaffold from '../components/ServicingScaffold';
import { useServicingLoan } from '../hooks/useLoanServicing';
import { useRepaymentTracking } from '../hooks/useRepaymentTracking';
import {
  INSTALLMENT_PENDING_CODE,
  LEGACY_PREPAYMENT_CODE,
  PREPAYMENT_OVERDUE_CODE,
  parseDong,
  prepaymentAllocationNote,
} from '../mappers/servicing';
import type { PartialPrepaymentQuote, RepaymentResult } from '../types';

type Route = RouteProp<ProfileStackParamList, 'PartialPrepayment'>;
type Nav = NativeStackNavigationProp<ProfileStackParamList, 'PartialPrepayment'>;

export default function PartialPrepaymentScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const nav = useNavigation<Nav>();
  const state = useServicingLoan(loanNumber);
  const balance = useBalance();
  const key = useRef(generateIdempotencyKey()).current;
  const [amountText, setAmountText] = useState('');
  const [quote, setQuote] = useState<PartialPrepaymentQuote | null>(null);
  const [result, setResult] = useState<RepaymentResult | null>(null);
  const trackedResult = useRepaymentTracking(result);
  const { requirePin } = usePinGuard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  if (state.loading && !state.data) {
    return <ServicingScaffold title="Trả trước một phần"><LoanDetailSkeleton label="Đang tải khoản vay" /></ServicingScaffold>;
  }
  if (state.error || !state.data) {
    return <ServicingScaffold title="Trả trước một phần"><ApplicationDetailError message={state.error ?? 'Không tải được khoản vay.'} retrying={state.loading} onRetry={state.reload} /></ServicingScaffold>;
  }
  const data = state.data;
  const amount = parseDong(amountText);
  const invalidAmount = amount === null || amount <= 0 || amount >= data.loan.principalOutstanding;
  const insufficient = !!quote && (balance.data?.available ?? 0) < quote.totalAmount;

  const requestQuote = async () => {
    if (busy || invalidAmount || amount === null) return;
    setBusy(true);
    setError(null);
    setErrorCode(null);
    try { setQuote(await createPartialPrepaymentQuote(data.applicationId, amount)); }
    catch (reason) {
      setError(toUserMessage(reason));
      setErrorCode(reason instanceof ApiError ? reason.code : null);
    }
    finally { setBusy(false); }
  };
  // Khoản vay sản phẩm cũ không trả trước được (D17); kỳ đang chờ ghi nhận phải hủy trước ở màn thanh toán kỳ.
  const blocked = errorCode === LEGACY_PREPAYMENT_CODE;
  const pendingInstallment = errorCode === INSTALLMENT_PENDING_CODE;
  // Quá hạn (D27): Payment từ chối báo giá; số liệu khoản vay còn mới thì báo trước, không cần gọi API.
  const overdue = errorCode === PREPAYMENT_OVERDUE_CODE
    || (!data.loan.stale && (data.loan.daysPastDue > 0 || data.loan.overdueAmount > 0));
  const confirm = async () => {
    if (!quote || busy || insufficient || quote.status !== 'ACTIVE') return;
    setBusy(true);
    setError(null);
    try {
      const pinToken = await requirePin('REPAYMENT', key);
      if (!pinToken) return;
      setResult(await confirmPartialPrepayment(quote.quoteId, key, pinToken));
      balance.reload();
    } catch (reason) { setError(toUserMessage(reason)); }
    finally { setBusy(false); }
  };

  return (
    <ServicingScaffold title="Trả trước một phần gốc" subtitle={loanNumber}>
      {trackedResult ? (
        <>
          <RepaymentResultCard result={trackedResult} />
          <DetailButton label="Xem lịch trả nợ mới" onPress={() => nav.goBack()} />
        </>
      ) : quote ? (
        <>
          <DetailCard title="Báo giá trả trước" icon="coins">
            <FinancialRows rows={[
              { label: 'Khoản của kỳ gần nhất', value: quote.scheduledDue },
              { label: 'Gốc trả trước thêm', value: quote.prepaidPrincipal },
              ...feeRows('Tổng phí trả trước', quote),
              { label: 'Tổng trừ từ ví', value: quote.totalAmount, emphasis: true },
              { label: 'Báo giá có hiệu lực đến', value: formatDateTime(quote.expiresAt) },
            ]} />
          </DetailCard>
          <DetailNote>{prepaymentAllocationNote(quote.allocationStrategy)}</DetailNote>
          <DetailNote>{feePolicyNote(quote.policyVersion)}</DetailNote>
          {insufficient ? <DetailNote tone="warn">Số dư ví không đủ cho tổng báo giá.</DetailNote> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <DetailButton label="Xác nhận trả trước" loading={busy} disabled={insufficient || quote.status !== 'ACTIVE'} onPress={confirm} />
          <DetailButton label="Thay đổi số tiền" variant="outline" disabled={busy} onPress={() => { setQuote(null); setError(null); }} />
        </>
      ) : (
        <>
          <DetailCard title="Số gốc muốn trả thêm" icon="coins">
            <Text style={styles.hint}>Gốc còn lại: {formatDong(data.loan.principalOutstanding)}</Text>
            <Field
              label="Số tiền trả trước"
              value={amountText}
              onChangeText={value => setAmountText(value.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="Ví dụ: 5.000.000"
              required
              error={amountText && invalidAmount ? 'Số tiền phải lớn hơn 0 và nhỏ hơn gốc còn lại.' : undefined}
            />
          </DetailCard>
          <DetailNote>Phí được tính trên phần gốc trả trước. Lãi chỉ tính đến ngày giao dịch, không thu lãi tương lai của phần gốc đã trả.</DetailNote>
          {overdue ? (
            <DetailNote tone="warn">Khoản vay đang quá hạn. Hãy thanh toán phần quá hạn trước khi trả trước gốc; phần gốc trả thêm lúc này sẽ chỉ trả nợ quá hạn mà vẫn bị tính phí.</DetailNote>
          ) : blocked || pendingInstallment ? (
            <DetailNote tone="warn">{error ?? ''}</DetailNote>
          ) : error ? <Text style={styles.error}>{error}</Text> : null}
          {overdue ? (
            <DetailButton label="Thanh toán phần quá hạn" onPress={() => nav.navigate('LoanPayment', { loanNumber })} />
          ) : pendingInstallment ? (
            <DetailButton label="Xem khoản chờ ghi nhận" variant="outline" onPress={() => nav.navigate('LoanPayment', { loanNumber })} />
          ) : null}
          {blocked || overdue ? null : (
            <DetailButton label="Xem số tiền cần thanh toán" loading={busy} disabled={invalidAmount || data.loan.stale} onPress={() => void requestQuote()} />
          )}
        </>
      )}
    </ServicingScaffold>
  );
}

const styles = StyleSheet.create({
  hint: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  error: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 19, color: Colors.red, marginVertical: Spacing.sm },
});
