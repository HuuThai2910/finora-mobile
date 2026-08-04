import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing, Text_ } from '@/theme';
import { BalanceCard, PHeader, PItem, Screen } from '@/components/phone';
import { Icon, Tag } from '@/components/ui';
import { EmptyState, ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong, formatSigned } from '@/utils/format';
import type { WalletStackParamList } from '@/navigation/types';
import { POSITION_TONE } from '../constant';
import { usePortfolio } from '../hook/useInvestment';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'Portfolio'>;

/** Màn 20 — danh mục đầu tư của tôi. */
export default function PortfolioScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, error, reload } = usePortfolio();

  return (
    <Screen onRefresh={reload} refreshing={loading && !!data}>
      <PHeader
        title="Danh mục của tôi"
        back
        right={
          <Icon
            name="zap"
            size={IconSize.sm}
            color={Colors.brand}
            // Lối vào cấu hình Auto-Invest
          />
        }
      />

      {loading && !data ? (
        <LoadingScreen cards={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? null : data.positions.length === 0 ? (
        <EmptyState
          icon="chart"
          title="Chưa có khoản đầu tư"
          hint="Chọn một khoản vay trên sàn để bắt đầu."
        />
      ) : (
        <>
          <BalanceCard
            label="ĐANG ĐẦU TƯ"
            value={formatDong(data.investedAmount)}
            meta={
              <View style={styles.meta}>
                <Text style={styles.metaItem}>
                  IRR <Text style={styles.metaStrong}>{data.irrPercent}%</Text>
                </Text>
                <Text style={styles.metaItem}>
                  NPL <Text style={styles.metaStrong}>{data.nplPercent}%</Text>
                </Text>
                <Text style={styles.metaItem}>{data.positionCount} khoản</Text>
              </View>
            }
          />

          <View style={styles.list}>
            {data.positions.map((p, i) => (
              <View key={p.loanId}>
                <PItem
                  label={
                    <Text style={styles.loan}>
                      <Text style={styles.loanId}>{p.loanId}</Text> · {p.sharePercent}%
                    </Text>
                  }
                  value={
                    <Tag tone={POSITION_TONE[p.status]} small>
                      {p.status}
                    </Tag>
                  }
                  last={!p.note}
                />
                {p.note ? (
                  <PItem
                    label={<Text style={styles.note}>{p.note}</Text>}
                    value={
                      p.lastCashflow ? formatSigned(p.lastCashflow, 'in') : undefined
                    }
                    valueTone={p.lastCashflow ? 'up' : undefined}
                    last={i === data.positions.length - 1}
                  />
                ) : null}
              </View>
            ))}
          </View>

          <PItem
            label="Cấu hình Auto-Invest"
            icon="zap"
            onPress={() => nav.navigate('AutoInvest')}
            last
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', gap: Spacing.xxl, marginTop: Spacing.md },
  metaItem: { ...Text_.micro, color: Colors.onDarkMuted },
  metaStrong: { ...Text_.microBold, color: Colors.onDark },
  list: { marginTop: Spacing.xl },
  loan: { ...Text_.body, color: Colors.ink },
  loanId: { ...Text_.bodyBold, color: Colors.ink },
  note: { ...Text_.micro, color: Colors.ink3 },
});
