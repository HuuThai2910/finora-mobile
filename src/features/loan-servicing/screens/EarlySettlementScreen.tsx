import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, Card, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import { formatDateTime, formatPercentValue } from '@/utils/format';
import { useBalance } from '@/features/wallet';
import { usePinGuard } from '@/features/pin';
import { confirmEarlySettlement, createEarlySettlementQuote } from '../api/servicingApi';
import FinancialRows from '../components/FinancialRows';
import RepaymentResultCard from '../components/RepaymentResultCard';
import { useServicingLoan } from '../hooks/useLoanServicing';
import { useRepaymentTracking } from '../hooks/useRepaymentTracking';
import type { EarlySettlementQuote, RepaymentResult } from '../types';

type Route = RouteProp<ProfileStackParamList, 'EarlySettlement'>;

export default function EarlySettlementScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const nav = useNavigation();
  const state = useServicingLoan(loanNumber);
  const balance = useBalance();
  const key = useRef(generateIdempotencyKey()).current;
  const [quote, setQuote] = useState<EarlySettlementQuote | null>(null);
  const [result, setResult] = useState<RepaymentResult | null>(null);
  const trackedResult = useRepaymentTracking(result);
  const { requirePin } = usePinGuard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.loading && !state.data) return <Screen><PHeader title="Tất toán trước hạn" back /><LoadingScreen cards={3} /></Screen>;
  if (state.error || !state.data) return <Screen><PHeader title="Tất toán trước hạn" back /><ErrorState message={state.error ?? 'Không tải được khoản vay.'} onRetry={state.reload} /></Screen>;
  const data = state.data;
  const insufficient = !!quote && (balance.data?.available ?? 0) < quote.totalAmount;

  const requestQuote = async () => {
    if (busy) return;
    setBusy(true); setError(null);
    try { setQuote(await createEarlySettlementQuote(data.applicationId)); }
    catch (reason) { setError(toUserMessage(reason)); }
    finally { setBusy(false); }
  };
  const confirm = async () => {
    if (!quote || busy || insufficient || quote.status !== 'ACTIVE') return;
    setBusy(true); setError(null);
    try {
      // Đóng bảng PIN là thôi xác nhận, không báo lỗi; báo giá vẫn giữ để bấm lại.
      const pinToken = await requirePin('REPAYMENT');
      if (!pinToken) return;
      setResult(await confirmEarlySettlement(quote.quoteId, key, pinToken));
      balance.reload();
    }
    catch (reason) { setError(toUserMessage(reason)); }
    finally { setBusy(false); }
  };

  return (
    <Screen>
      <PHeader title="Tất toán trước hạn" back hint={loanNumber} />
      {trackedResult ? <><RepaymentResultCard result={trackedResult} /><Button label="Về khoản vay" onPress={() => nav.goBack()} style={styles.action} /></> : quote ? (
        <>
          <Card style={styles.card}>
            <Text style={styles.title}>Báo giá tất toán</Text>
            <FinancialRows rows={[
              { label: 'Gốc còn lại', value: quote.principalPortion },
              { label: 'Lãi đến ngày tất toán', value: quote.interestPortion },
              { label: 'Phí/phạt trên core', value: quote.coreFeePortion + quote.penaltyPortion },
              { label: `Phí tất toán (${formatPercentValue(quote.feeRate * 100)})`, value: quote.platformFee },
              { label: 'Tổng trừ từ ví', value: quote.totalAmount, emphasis: true },
              { label: 'Hết hiệu lực', value: formatDateTime(quote.expiresAt) },
            ]} />
          </Card>
          {insufficient ? <InfoNote tone="warn">Số dư ví không đủ cho tổng báo giá.</InfoNote> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Xác nhận tất toán" loading={busy} disabled={insufficient || quote.status !== 'ACTIVE'} onPress={confirm} style={styles.action} />
          <Button label="Lấy báo giá mới" variant="outline" disabled={busy} onPress={() => { setQuote(null); setError(null); }} />
        </>
      ) : (
        <>
          <Card style={styles.card}>
            <Text style={styles.title}>Đóng toàn bộ khoản vay</Text>
            <Text style={styles.body}>Báo giá được lấy trực tiếp từ Fineract, gồm gốc còn lại, lãi phát sinh đến hôm nay, phí/phạt và phí tất toán theo chính sách.</Text>
          </Card>
          <InfoNote tone="warn">Sau khi xác nhận thành công, khoản vay sẽ chuyển sang tất toán và không thể hoàn tác.</InfoNote>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Lập báo giá tất toán" loading={busy} disabled={data.loan.stale} onPress={requestQuote} style={styles.action} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.lg },
  title: { ...Text_.title, color: Colors.authInk },
  body: { ...Text_.micro, color: Colors.authMuted },
  error: { ...Text_.microBold, color: Colors.red, marginTop: Spacing.lg },
  action: { marginVertical: Spacing.xl },
});
