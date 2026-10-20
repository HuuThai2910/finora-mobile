import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import type { CreateWithdrawalRequest, WithdrawalPolicy } from '@/types/wallet';
import { WITHDRAW_FORM_NOTE } from '../constant';
import { useWithdrawForm } from '../hook/useWithdrawForm';
import {
  ACCOUNT_NUMBER_MAX_LENGTH,
  HOLDER_MAX_LENGTH,
  maxWithdrawable,
  withdrawBlockedReason,
} from '../schemas/withdrawalForm';
import WalletButton from './WalletButton';
import WalletNote from './WalletNote';
import WithdrawAmountField from './WithdrawAmountField';
import WithdrawBankPicker from './WithdrawBankPicker';
import WithdrawInputRow from './WithdrawInputRow';

type Props = {
  policy: WithdrawalPolicy;
  submitting: boolean;
  /** Lỗi khi gửi lệnh (mạng, Payment từ chối, PIN), khác lỗi nhập tại từng ô. */
  submitError: string | null;
  onSubmit: (request: CreateWithdrawalRequest) => void;
  /** Người dùng vừa sửa form: màn xoá lỗi của lần gửi trước. */
  onEdit: () => void;
};

/**
 * Form rút tiền: tài khoản nhận (ngân hàng, số tài khoản, tên chủ tài khoản), số tiền, nút gửi. Form chỉ đưa lên màn
 * request đã hợp lệ; PIN, idempotency và việc gọi API là của màn. Hết hạn mức hoặc số dư chưa đủ mức tối thiểu thì
 * khoá nút và nói rõ lý do thay vì để người dùng nhập rồi mới bị từ chối.
 */
export default function WithdrawForm({ policy, submitting, submitError, onSubmit, onEdit }: Props) {
  const form = useWithdrawForm(policy, onEdit);
  const blocked = withdrawBlockedReason(policy);

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
        <WithdrawBankPicker
          banks={policy.banks}
          value={form.values.bankCode}
          onChange={code => form.change('bankCode', code)}
          error={form.errors.bankCode}
        />
        <WithdrawInputRow
          icon="creditCard"
          label="Số tài khoản"
          kind="digits"
          maxLength={ACCOUNT_NUMBER_MAX_LENGTH}
          value={form.values.accountNumber}
          onChangeText={value => form.change('accountNumber', value)}
          placeholder="6–19 chữ số"
          error={form.errors.accountNumber}
        />
        <WithdrawInputRow
          icon="user"
          label="Tên chủ tài khoản"
          kind="name"
          maxLength={HOLDER_MAX_LENGTH}
          value={form.values.accountHolderName}
          onChangeText={value => form.change('accountHolderName', value)}
          placeholder="VD: NGUYEN VAN AN"
          helper="Đúng tên trên tài khoản ngân hàng; hệ thống tự viết hoa khi gửi."
          error={form.errors.accountHolderName}
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
