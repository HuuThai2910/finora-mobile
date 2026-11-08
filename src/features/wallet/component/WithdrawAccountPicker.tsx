import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import type { BankAccount } from '@/types/wallet';
import BankAccountRow from './BankAccountRow';
import WalletButton from './WalletButton';

type Props = {
  accounts: readonly BankAccount[];
  value: string | null;
  onChange: (bankAccountId: string) => void;
  onAdd: () => void;
  error?: string;
};

/**
 * Chọn tài khoản nhận tiền rút trong số tài khoản đã liên kết (BL-001). Chưa có tài khoản nào thì chỉ còn lối thêm
 * tài khoản: app không cho gõ tay số tài khoản để rút nữa.
 */
export default function WithdrawAccountPicker({ accounts, value, onChange, onAdd, error }: Props) {
  if (accounts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Bạn chưa liên kết tài khoản ngân hàng nào. Liên kết tài khoản đứng tên bạn để rút tiền.
        </Text>
        <WalletButton variant="outline" icon="plus" label="Liên kết ngân hàng" onPress={onAdd} />
      </View>
    );
  }

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Tài khoản nhận">
      {accounts.map((account, index) => (
        <BankAccountRow
          key={account.bankAccountId}
          account={account}
          divided={index > 0}
          selectable={{ selected: account.bankAccountId === value, onSelect: () => onChange(account.bankAccountId) }}
        />
      ))}
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      <WalletButton variant="text" icon="plus" label="Thêm tài khoản khác" onPress={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { gap: Spacing.lg },
  emptyText: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  error: { fontFamily: FontFamily.medium, fontSize: 13, color: Colors.tagRedText, paddingHorizontal: Spacing.sm },
});
