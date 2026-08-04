import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Icon } from '@/components/ui';
import { EmptyState, ErrorState, LoadingScreen } from '@/components/feedback';
import { formatSigned } from '@/utils/format';
import type { WalletStackParamList } from '@/navigation/types';
import { RECONCILE_NOTE } from '../constant';
import { useTransactions } from '../hook/useWallet';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'WalletHistory'>;

/** Màn 25 — lịch sử ví, cũng là màn gốc của tab Ví. */
export default function WalletHistoryScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, error, reload } = useTransactions();

  return (
    <Screen onRefresh={reload} refreshing={loading && !!data}>
      <PHeader
        title="Lịch sử ví"
        right={<Icon name="download" size={IconSize.sm} color={Colors.ink2} />}
      />

      {loading && !data ? (
        <LoadingScreen cards={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState
          icon="wallet"
          title="Chưa có giao dịch"
          hint="Nạp tiền vào ví để bắt đầu."
          actionLabel="Nạp tiền"
          onAction={() => nav.navigate('TopUp')}
        />
      ) : (
        <>
          {data.map((tx, i) => (
            <PItem
              key={tx.id}
              label={<Text style={styles.desc}>{tx.description}</Text>}
              sub={`${tx.occurredAt}/2026`}
              value={formatSigned(tx.amount, tx.direction)}
              valueTone={tx.direction === 'in' ? 'up' : undefined}
              last={i === data.length - 1}
            />
          ))}

          <View style={styles.footer}>
            <Text style={styles.note}>{RECONCILE_NOTE}</Text>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  desc: { ...Text_.bodyBold, color: Colors.ink },
  footer: { marginTop: Spacing.xl },
  note: { ...Text_.micro, color: Colors.ink3, textAlign: 'center' },
});
