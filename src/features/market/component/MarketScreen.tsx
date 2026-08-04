import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Icon, InfoNote } from '@/components/ui';
import { EmptyState, ErrorState, LoadingScreen } from '@/components/feedback';
import type { MarketStackParamList } from '@/navigation/types';
import { MARKET_NOTE } from '../constant';
import { useMarketLoans } from '../hook/useMarket';
import LoanCard from './LoanCard';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'Market'>;

/** Màn 8 — sàn khoản vay, màn gốc của tab Sàn. */
export default function MarketScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, error, reload } = useMarketLoans();

  return (
    <Screen onRefresh={reload} refreshing={loading && !!data}>
      <PHeader
        title="Sàn khoản vay"
        right={<Icon name="search" size={IconSize.sm} color={Colors.ink2} />}
      />

      {loading && !data ? (
        <LoadingScreen cards={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState
          icon="search"
          title="Chưa có khoản vay đang gọi vốn"
          hint="Bật Auto-Invest để được khớp ngay khi có hồ sơ mới."
        />
      ) : (
        <>
          {data.map(loan => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => nav.navigate('LoanDetail', { loanId: loan.id })}
            />
          ))}

          <InfoNote style={styles.note}>{MARKET_NOTE}</InfoNote>

          <PItem
            label="Sản phẩm vay"
            icon="grid"
            onPress={() => nav.navigate('Products')}
            style={styles.link}
          />
          <PItem
            label="Gói vay ưu đãi"
            icon="sparkles"
            onPress={() => nav.navigate('VentoPackages')}
            last
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { marginBottom: Spacing.xl },
  link: { marginTop: Spacing.md },
});
