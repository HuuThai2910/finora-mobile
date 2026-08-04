import { Colors } from '@/constants/colors';
import { IconSize, Spacing } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Icon, InfoNote } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { TOPUP_NOTE } from '../constant';
import { useTopUpInstruction } from '../hook/useWallet';
import QrPlaceholder from './QrPlaceholder';

/** Màn 23 — nạp tiền qua VietQR định danh. */
export default function TopUpScreen() {
  const { data, loading, error, reload } = useTopUpInstruction();

  return (
    <Screen>
      <PHeader
        title="Nạp tiền — VietQR"
        back
        right={<Icon name="wallet" size={IconSize.sm} color={Colors.ink2} />}
      />

      {loading ? (
        <LoadingScreen cards={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data ? (
        <>
          <QrPlaceholder payload={data.qrPayload} />

          <PItem label="Tài khoản ảo định danh" value={data.virtualAccount} />
          <PItem label="Ngân hàng" value={data.bankName} />
          <PItem label="Nội dung" value={data.transferNote} last />

          <InfoNote style={{ marginTop: Spacing.xl }}>{TOPUP_NOTE}</InfoNote>
        </>
      ) : null}
    </Screen>
  );
}
