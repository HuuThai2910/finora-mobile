import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import { useCountdown } from '../hook/useCountdown';
import { useLinkBankAccount } from '../hook/useLinkBankAccount';
import { BANK_ACCOUNT_NUMBER_MAX_LENGTH, BANK_LINK_OTP_LENGTH } from '../mappers/bankAccount';
import { formatCountdown } from '../mappers/topUp';
import BankAccountRow from './BankAccountRow';
import BankPicker from './BankPicker';
import WalletButton from './WalletButton';
import WalletHistorySkeleton from './WalletHistorySkeleton';
import WalletHistoryStatus from './WalletHistoryStatus';
import WalletNote from './WalletNote';
import WalletScaffold from './WalletScaffold';
import WithdrawInputRow from './WithdrawInputRow';

/**
 * Thêm tài khoản ngân hàng (BL-001), ba bước trên cùng một màn: tài khoản → mã xác thực → xong. Màn chỉ ghép giao diện
 * theo bước; tra cứu, PIN, OTP và idempotency nằm ở `useLinkBankAccount`.
 */
export default function LinkBankAccountScreen() {
  const nav = useNavigation();
  const link = useLinkBankAccount();

  return (
    <WalletScaffold title="Thêm tài khoản ngân hàng">
      {link.step === 'account' ? <AccountStep link={link} /> : null}
      {link.step === 'otp' ? <OtpStep link={link} /> : null}
      {link.step === 'done' && link.linked ? (
        <>
          <View style={styles.card}>
            <View style={styles.doneHead}>
              <Icon name="circleCheck" size={28} color={Colors.authPrimary} />
              <Text style={styles.title} accessibilityRole="header">
                Liên kết thành công
              </Text>
            </View>
            <BankAccountRow account={link.linked} />
          </View>
          <WalletButton label="Xong" icon="check" onPress={() => nav.goBack()} />
        </>
      ) : null}
    </WalletScaffold>
  );
}

type Link = ReturnType<typeof useLinkBankAccount>;

function AccountStep({ link }: { link: Link }) {
  if (!link.banks.data) {
    if (link.banks.loading) return <WalletHistorySkeleton cards={2} label="Đang tải danh sách ngân hàng" />;
    return (
      <WalletHistoryStatus
        kind="error"
        message={link.banks.error ?? 'Không tải được danh sách ngân hàng.'}
        onRetry={link.banks.reload}
      />
    );
  }
  const busy = link.busy !== null;
  const { inquiry } = link;

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          Tài khoản nhận tiền
        </Text>
        <BankPicker banks={link.banks.data} value={link.bankCode} onChange={link.chooseBank} disabled={busy} />
        <WithdrawInputRow
          icon="creditCard"
          label="Số tài khoản"
          kind="digits"
          maxLength={BANK_ACCOUNT_NUMBER_MAX_LENGTH}
          value={link.accountNumber}
          onChangeText={link.changeAccountNumber}
          placeholder="6–19 chữ số"
          helper="Chỉ liên kết được tài khoản đứng tên chính bạn."
        />
        {inquiry ? (
          <View style={[styles.holder, !inquiry.nameMatched && styles.holderMismatch]} accessibilityLiveRegion="polite">
            <Icon
              name={inquiry.nameMatched ? 'shieldCheck' : 'shieldAlert'}
              size={20}
              color={inquiry.nameMatched ? Colors.authPrimary : Colors.tagRedText}
            />
            <View style={styles.holderBody}>
              <Text style={styles.holderLabel}>Chủ tài khoản</Text>
              <Text style={styles.holderName}>{inquiry.accountHolderName}</Text>
              {!inquiry.nameMatched ? (
                <Text style={styles.holderWarn}>
                  Tên này không trùng họ tên đã xác minh của bạn nên không liên kết được.
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>

      {link.error ? <WalletNote tone="danger" text={link.error} /> : null}
      {inquiry?.nameMatched ? (
        <WalletButton
          label="Liên kết tài khoản"
          icon="shieldCheck"
          loading={link.busy === 'start'}
          disabled={busy}
          onPress={() => void link.start()}
        />
      ) : (
        <WalletButton
          label="Kiểm tra tài khoản"
          icon="search"
          loading={link.busy === 'inquiry'}
          disabled={busy || !link.bankCode || !link.numberValid}
          onPress={() => {
            Keyboard.dismiss();
            void link.lookUp();
          }}
        />
      )}
    </>
  );
}

function OtpStep({ link }: { link: Link }) {
  const { challenge } = link;
  const resendLeft = useCountdown(challenge?.resendAvailableAt ?? null, true);
  const expiresLeft = useCountdown(challenge?.otpExpiresAt ?? null, true);
  if (!challenge) return null;
  const busy = link.busy !== null;
  const canResend = challenge.resendsLeft > 0 && resendLeft === 0;

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          Nhập mã xác thực
        </Text>
        <Text style={styles.body}>
          {`${challenge.bankName} đã gửi mã ${BANK_LINK_OTP_LENGTH} số để xác nhận liên kết tài khoản `}
          <Text style={styles.strong}>{challenge.accountNumberMasked}</Text>
          {' đứng tên '}
          <Text style={styles.strong}>{challenge.accountHolderName}</Text>
          {'. Mã được gửi vào mục Thông báo của FINORA.'}
        </Text>
        <WithdrawInputRow
          icon="lock"
          label="Mã xác thực"
          kind="digits"
          maxLength={BANK_LINK_OTP_LENGTH}
          value={link.otp}
          onChangeText={link.setOtp}
          placeholder={`${BANK_LINK_OTP_LENGTH} chữ số`}
          helper={
            expiresLeft === 0 ? 'Mã đã hết hạn, hãy gửi lại mã.' : `Mã hết hạn sau ${formatCountdown(expiresLeft ?? 0)}.`
          }
        />
      </View>

      {link.error ? <WalletNote tone="danger" text={link.error} /> : null}
      <WalletButton
        label="Xác nhận"
        icon="check"
        loading={link.busy === 'confirm'}
        disabled={busy || link.otp.length !== BANK_LINK_OTP_LENGTH}
        onPress={() => {
          Keyboard.dismiss();
          void link.confirm();
        }}
      />
      <WalletButton
        variant="outline"
        icon="refreshCw"
        label={
          challenge.resendsLeft <= 0
            ? 'Đã hết lượt gửi lại mã'
            : canResend
              ? 'Gửi lại mã'
              : `Gửi lại mã sau ${formatCountdown(resendLeft ?? 0)}`
        }
        loading={link.busy === 'resend'}
        disabled={busy || !canResend}
        onPress={() => void link.resend()}
      />
      <WalletButton variant="text" label="Đổi tài khoản khác" onPress={link.backToAccount} disabled={busy} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.lg,
    padding: Spacing.lg,
    paddingTop: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  title: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 22, color: Colors.authInk },
  body: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 21, color: Colors.authMuted },
  strong: { fontFamily: FontFamily.semibold, color: Colors.authInk },
  doneHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  holder: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    backgroundColor: Colors.authFocusBg,
  },
  holderMismatch: { backgroundColor: Colors.amberBg },
  holderBody: { flex: 1, gap: 2 },
  holderLabel: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.authMuted },
  holderName: { fontFamily: FontFamily.bold, fontSize: 15, letterSpacing: 0.3, color: Colors.authInk },
  holderWarn: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
});
