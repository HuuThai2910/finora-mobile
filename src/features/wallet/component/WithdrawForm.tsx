import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import type { BankAccount, CreateWithdrawalRequest, WithdrawalPolicy } from '@/types/wallet';
import { WITHDRAW_FORM_NOTE } from '../constant';
import { useWithdrawForm } from '../hook/useWithdrawForm';
import { maxWithdrawable, withdrawBlockedReason } from '../schemas/withdrawalForm';
import WalletButton from './WalletButton';
import WalletNote from './WalletNote';
import WithdrawAccountPicker from './WithdrawAccountPicker';
import WithdrawAmountField from './WithdrawAmountField';

type Props = {
  policy: WithdrawalPolicy;
  /** Tài khoản ngân hàng đã liên kết (BL-001), mặc định đứng đầu. */
  accounts: readonly BankAccount[];
  /** Mở màn liên kết thêm tài khoản. */
  onAddAccount: () => void;
  submitting: boolean;
  /** Lỗi khi gửi lệnh (mạng, Payment từ chối, PIN), khác lỗi nhập tại từng ô. */
  submitError: string | null;
  onSubmit: (request: CreateWithdrawalRequest) => void;
  /** Người dùng vừa sửa form: màn xoá lỗi của lần gửi trước. */
  onEdit: () => void;
};

/**
 * Form rút tiền: tài khoản nhận (một trong các tài khoản đã liên kết), số tiền, nút gửi. Form chỉ đưa lên màn request
 * đã hợp lệ; PIN, idempotency và việc gọi API là của màn. Hết hạn mức, số dư chưa đủ mức tối thiểu hoặc chưa liên kết
 * tài khoản nào thì khoá nút và nói rõ lý do thay vì để người dùng nhập rồi mới bị từ chối.
 */
export default function WithdrawForm({
  policy,
  accounts,
  onAddAccount,
  submitting,
  submitError,
  onSubmit,
  onEdit,
}: Props) {
  const form = useWithdrawForm(policy, accounts, onEdit);
  const blocked = withdrawBlockedReason(policy) ?? (accounts.length === 0 ? 'Liên kết tài khoản ngân hàng để rút tiền.' : null);

  const submit = () => {
    if (submitting || blocked) return;
    const request = form.toRequest();
    if (!request) return;
    Keyboard.dismiss();
    onSubmit(request);
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          Tài khoản nhận
        </Text>
        <WithdrawAccountPicker
          accounts={accounts}
          value={form.values.bankAccountId}
          onChange={id => form.change('bankAccountId', id)}
          onAdd={onAddAccount}
          error={form.errors.bankAccountId}
        />
      </View>

      <WithdrawAmountField
        amount={form.values.amount}
        onChange={value => form.change('amount', value)}
        minimum={policy.minimumAmount}
        maximum={maxWithdrawable(policy)}
        fee={policy.feeAmount}
        error={form.errors.amount}
      />

      {blocked ? <WalletNote tone="warn" text={blocked} /> : null}
      <WalletButton label="Rút tiền" icon="banknoteArrowUp" onPress={submit} loading={submitting} disabled={!!blocked} />
      {submitError ? <WalletNote tone="danger" text={submitError} /> : null}
      <WalletNote text={WITHDRAW_FORM_NOTE} />
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
});
