import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ApplicationDetailError, DetailButton, DetailCard, DetailNote } from '@/features/applications';
import { Colors } from '@/constants/colors';
import { ApiError, generateIdempotencyKey, toUserMessage } from '@/lib/api';
import type { ProfileStackParamList } from '@/navigation/types';
import { FontFamily, Spacing } from '@/theme';
import { formatDateTime } from '@/utils/format';
import { useBalance } from '@/features/wallet';
import { usePinGuard } from '@/features/pin';
import { confirmEarlySettlement, createEarlySettlementQuote } from '../api/servicingApi';
import FinancialRows from '../components/FinancialRows';
import { feePolicyNote, feeRows } from '../mappers/fee';
import LoanDetailSkeleton from '../components/LoanDetailSkeleton';
import RepaymentResultCard from '../components/RepaymentResultCard';
import ServicingScaffold from '../components/ServicingScaffold';
import { useServicingLoan } from '../hooks/useLoanServicing';
import { useRepaymentTracking } from '../hooks/useRepaymentTracking';
import { INSTALLMENT_PENDING_CODE, LEGACY_PREPAYMENT_CODE } from '../mappers/servicing';
import type { EarlySettlementQuote, RepaymentResult } from '../types';

type Route = RouteProp<ProfileStackParamList, 'EarlySettlement'>;
type Nav = NativeStackNavigationProp<ProfileStackParamList, 'EarlySettlement'>;

/** Mở màn là lấy báo giá ngay; cảnh báo không hoàn tác chỉ xuất hiện ở lần xác nhận cuối. */
export default function EarlySettlementScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const nav = useNavigation<Nav>();
  const state = useServicingLoan(loanNumber);
  const balance = useBalance();
  const key = useRef(generateIdempotencyKey()).current;
  const requested = useRef(false);
  const [quote, setQuote] = useState<EarlySettlementQuote | null>(null);
  const [result, setResult] = useState<RepaymentResult | null>(null);
  const trackedResult = useRepaymentTracking(result);
  const { requirePin } = usePinGuard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const failQuote = (reason: unknown) => {
    setError(toUserMessage(reason));
    setErrorCode(reason instanceof ApiError ? reason.code : null);
  };

  const applicationId = state.data?.applicationId;
  const stale = state.data?.loan.stale ?? false;
  useEffect(() => {
    if (!applicationId || stale || requested.current) return;
    requested.current = true;
    setBusy(true);
    setError(null);
    createEarlySettlementQuote(applicationId)
      .then(setQuote)
      .catch(failQuote)
      .finally(() => setBusy(false));
  }, [applicationId, stale]);

  const requestQuote = async () => {
    if (!applicationId || busy || stale) return;
    requested.current = true;
    setBusy(true);
    setError(null);
    setErrorCode(null);
    try { setQuote(await createEarlySettlementQuote(applicationId)); }
    catch (reason) { failQuote(reason); }
    finally { setBusy(false); }
  };

  const confirm = async () => {
    if (!quote || busy || quote.status !== 'ACTIVE') return;
    const insufficient = (balance.data?.available ?? 0) < quote.totalAmount;
    if (insufficient) return;
    setBusy(true);
    setError(null);
    try {
      const pinToken = await requirePin('REPAYMENT');
      if (!pinToken) return;
      setResult(await confirmEarlySettlement(quote.quoteId, key, pinToken));
      balance.reload();
    } catch (reason) { setError(toUserMessage(reason)); }
    finally { setBusy(false); }
  };

  const askConfirm = () => Alert.alert(
    'Xác nhận tất toán toàn bộ?',
    'Sau khi giao dịch thành công, khoản vay sẽ được đóng và không thể hoàn tác.',
    [
      { text: 'Quay lại', style: 'cancel' },
      { text: 'Tiếp tục', style: 'destructive', onPress: () => void confirm() },
    ],
  );

  if (state.loading && !state.data) {
    return <ServicingScaffold title="Tất toán trước hạn"><LoanDetailSkeleton label="Đang lập báo giá tất toán" /></ServicingScaffold>;
  }
  if (state.error || !state.data) {
    return <ServicingScaffold title="Tất toán trước hạn"><ApplicationDetailError message={state.error ?? 'Không tải được khoản vay.'} retrying={state.loading} onRetry={state.reload} /></ServicingScaffold>;
  }

  const insufficient = !!quote && (balance.data?.available ?? 0) < quote.totalAmount;
  // Khoản vay sản phẩm cũ không tự tất toán được (D17); kỳ đang chờ ghi nhận phải hủy trước ở màn thanh toán kỳ.
  const blocked = errorCode === LEGACY_PREPAYMENT_CODE;
  const pendingInstallment = errorCode === INSTALLMENT_PENDING_CODE;

  return (
    <ServicingScaffold title="Tất toán trước hạn" subtitle={loanNumber}>
      {trackedResult ? (
        <>
          <RepaymentResultCard result={trackedResult} />
          <DetailButton label="Về chi tiết khoản vay" onPress={() => nav.goBack()} />
        </>
      ) : quote ? (
        <>
          <DetailCard title="Số tiền cần thanh toán" icon="circleCheck">
            <FinancialRows rows={[
              { label: 'Gốc còn lại', value: quote.principalPortion },
              { label: 'Lãi phát sinh đến hôm nay', value: quote.interestPortion },
              { label: 'Phí/phạt nghĩa vụ hiện tại', value: quote.coreFeePortion + quote.penaltyPortion },
              ...feeRows('Tổng phí tất toán', quote),
              { label: 'Tổng trừ từ ví', value: quote.totalAmount, emphasis: true },
              { label: 'Báo giá có hiệu lực đến', value: formatDateTime(quote.expiresAt) },
            ]} />
          </DetailCard>
          <DetailNote>Không thu lãi của các tháng tương lai. Phí tất toán được tính trên gốc còn lại theo thời gian đã sử dụng khoản vay.</DetailNote>
          <DetailNote>{feePolicyNote(quote.policyVersion)}</DetailNote>
          {insufficient ? <DetailNote tone="warn">Số dư ví không đủ cho tổng báo giá.</DetailNote> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <DetailButton label="Xác nhận tất toán" onPress={askConfirm} loading={busy} disabled={insufficient || quote.status !== 'ACTIVE'} />
          <DetailButton label="Lấy báo giá mới" variant="outline" disabled={busy} onPress={() => void requestQuote()} />
        </>
      ) : (
        <>
          {error ? null : <LoanDetailSkeleton label="Đang lập báo giá tất toán" />}
          {stale ? <DetailNote tone="warn">Số liệu đang chờ đồng bộ. Hãy quay lại làm mới khoản vay.</DetailNote> : null}
          {blocked ? (
            <DetailNote tone="warn">{error ?? ''}</DetailNote>
          ) : pendingInstallment ? (
            <DetailCard title="Còn khoản chờ ghi nhận" icon="alert">
              <Text style={styles.error}>{error}</Text>
              <DetailButton label="Xem khoản chờ ghi nhận" variant="outline" onPress={() => nav.navigate('LoanPayment', { loanNumber })} />
              <DetailButton label="Thử lại" variant="outline" onPress={() => void requestQuote()} disabled={busy || stale} />
            </DetailCard>
          ) : error ? (
            <DetailCard title="Chưa lấy được báo giá" icon="alert">
              <Text style={styles.error}>{error}</Text>
              <DetailButton label="Thử lại" variant="outline" onPress={() => void requestQuote()} disabled={busy || stale} />
            </DetailCard>
          ) : null}
        </>
      )}
    </ServicingScaffold>
  );
}

const styles = StyleSheet.create({
  error: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 19, color: Colors.red, marginVertical: Spacing.sm },
});
