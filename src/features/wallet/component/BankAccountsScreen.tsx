import { ActionSheetIOS, Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { FontFamily, SoftShadow, Radius, Spacing } from '@/theme';
import type { BankAccount } from '@/types/wallet';
import { BANK_LINK_NOTE } from '../constant';
import { useBankAccounts } from '../hook/useBankAccounts';
import BankAccountRow from './BankAccountRow';
import WalletButton from './WalletButton';
import WalletHistorySkeleton from './WalletHistorySkeleton';
import WalletHistoryStatus from './WalletHistoryStatus';
import WalletNote from './WalletNote';
import WalletScaffold from './WalletScaffold';

/** Màn có mặt ở cả stack Ví và stack Hồ sơ, nên chỉ dựa vào tên route có ở cả hai. */
type Nav = { navigate: (route: 'LinkBankAccount') => void };

/**
 * Ngân hàng liên kết (BL-001): danh sách tài khoản nhận tiền rút, thêm tài khoản mới, đặt mặc định, huỷ liên kết.
 * Màn chỉ điều phối; tải danh sách, PIN và gọi API nằm ở `useBankAccounts`.
 */
export default function BankAccountsScreen() {
  const nav = useNavigation<Nav>();
  const bank = useBankAccounts();

  const confirmRemove = (account: BankAccount) =>
    Alert.alert(
      'Huỷ liên kết tài khoản?',
      `${account.bankName} ${account.accountNumberMasked} sẽ không còn nhận được tiền rút. Bạn có thể liên kết lại sau.`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        { text: 'Huỷ liên kết', style: 'destructive', onPress: () => void bank.remove(account.bankAccountId) },
      ],
    );

  const openActions = (account: BankAccount) => {
    const options = account.defaultAccount ? ['Huỷ liên kết', 'Đóng'] : ['Đặt làm mặc định', 'Huỷ liên kết', 'Đóng'];
    const handle = (choice: string) => {
      if (choice === 'Đặt làm mặc định') void bank.makeDefault(account.bankAccountId);
      if (choice === 'Huỷ liên kết') confirmRemove(account);
    };
    const title = `${account.bankName} ${account.accountNumberMasked}`;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { title, options, cancelButtonIndex: options.length - 1, destructiveButtonIndex: options.indexOf('Huỷ liên kết') },
        index => handle(options[index] ?? ''),
      );
      return;
    }
    Alert.alert(
      title,
      undefined,
      options.map(option => ({
        text: option,
        style: option === 'Đóng' ? 'cancel' : option === 'Huỷ liên kết' ? 'destructive' : 'default',
        onPress: () => handle(option),
      })),
    );
  };

  const renderList = () => {
    if (!bank.loaded) {
      if (bank.loading) return <WalletHistorySkeleton cards={2} label="Đang tải tài khoản ngân hàng" />;
      return (
        <WalletHistoryStatus
          kind="error"
          message={bank.loadError ?? 'Không tải được tài khoản ngân hàng.'}
          onRetry={bank.reload}
        />
      );
    }
    if (bank.accounts.length === 0) {
      return (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>Chưa có tài khoản nào</Text>
          <Text style={styles.emptyBody}>
            Liên kết tài khoản ngân hàng đứng tên bạn để rút tiền từ ví FINORA về ngân hàng.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.card}>
        {bank.accounts.map((account, index) => (
          <BankAccountRow
            key={account.bankAccountId}
            account={account}
            divided={index > 0}
            disabled={bank.busyId === account.bankAccountId}
            onPress={() => openActions(account)}
          />
        ))}
      </View>
    );
  };

  return (
    <WalletScaffold title="Ngân hàng liên kết" refreshing={bank.loading && bank.loaded} onRefresh={bank.reload}>
      {renderList()}
      {bank.error ? <WalletNote tone="danger" text={bank.error} /> : null}
      <WalletButton label="Thêm tài khoản ngân hàng" icon="plus" onPress={() => nav.navigate('LinkBankAccount')} />
      <WalletNote text={BANK_LINK_NOTE} />
    </WalletScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  emptyTitle: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 22, color: Colors.authInk, padding: Spacing.sm },
  emptyBody: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authMuted,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
});
